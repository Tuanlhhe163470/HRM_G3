using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.TimeAttendance;
using HRM_Application.Interfaces.Repositories;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class AttendanceService : IAttendanceService
    {
        #region Constants
        private const int MaxZombieLogHours = 16;
        private const double AllowedOfficeRadiusInMeters = 100.0;
        private const string OutOfOfficeWarning = "[⚠️ CẢNH BÁO: Chấm công ngoài phạm vi văn phòng hoặc không có GPS] ";
        private const string OutOfOfficeOutWarning = " | [⚠️ Out: Ngoài phạm vi]";
        #endregion

        #region Dependencies
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IShiftRepository _shiftRepo;
        private readonly IPublicHolidayRepository _publicHolidayRepo;
        private readonly ILeaveRequestRepository _leaveRequestRepo;
        private readonly IOvertimeRequestRepository _otRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IMapper _mapper;
        #endregion

        public AttendanceService(
            IAttendanceRepository attendanceRepo,
            IShiftRepository shiftRepo,
            IPublicHolidayRepository publicHolidayRepo,
            IMapper mapper,
            ILeaveRequestRepository leaveRequestRepo,
            IOvertimeRequestRepository otRepo,
            IEmployeeRepository employeeRepo)
        {
            _attendanceRepo = attendanceRepo;
            _shiftRepo = shiftRepo;
            _publicHolidayRepo = publicHolidayRepo;
            _mapper = mapper;
            _leaveRequestRepo = leaveRequestRepo;
            _otRepo = otRepo;
            _employeeRepo = employeeRepo;
        }

        #region Main Services (CheckIn, CheckOut, Logs)

        /// <summary>
        /// Xử lý logic Check-in của nhân viên
        /// </summary>
        public async Task<AttendanceLogResponse> CheckInAsync(int employeeId, CheckInRequest request)
        {
            var now = DateTime.Now;
            var today = now.Date;

            // 1. Kiểm tra vị trí
            string systemWarning = IsWithinOfficeRadius(request.Latitude, request.Longitude) ? "" : OutOfOfficeWarning;

            // 2. Validate các điều kiện cơ bản (Ngày lễ, Zombie log)
            await ValidateNotPublicHolidayAsync(today);
            await HandleExistingActiveLogAsync(employeeId);

            // 3. Xác định ca làm việc
            var (selectedShift, determinedWorkDate) = await DetermineShiftForCheckInAsync(now);

            // 4. Validate ca làm việc
            ValidateWorkDayForShift(selectedShift, determinedWorkDate);
            await ValidateDuplicateCheckInAsync(employeeId, selectedShift.Id, determinedWorkDate);

            // 5. Khởi tạo và lưu Log
            var newLog = CreateAttendanceLog(employeeId, selectedShift, determinedWorkDate, now, request, systemWarning);
            await _attendanceRepo.AddAsync(newLog);

            var response = _mapper.Map<AttendanceLogResponse>(newLog);
            response.ShiftName = selectedShift.ShiftName;

            return response;
        }

        /// <summary>
        /// Xử lý logic Check-out của nhân viên
        /// </summary>
        public async Task<AttendanceLogResponse> CheckOutAsync(int employeeId, CheckOutRequest request)
        {
            var log = await _attendanceRepo.GetActiveLogAsync(employeeId);
            if (log == null)
            {
                throw new InvalidOperationException("Bạn chưa check-in, không thể check-out!");
            }

            if (IsZombieLog(log))
            {
                await CloseZombieLogAsync(log);
                throw new InvalidOperationException($"Ca làm việc ngày {log.WorkDate:dd/MM} đã quá hạn để Check-out. Hệ thống đã tự động chốt là 'Quên Check-out'!");
            }

            // Cập nhật thông tin Check-out
            string systemWarning = IsWithinOfficeRadius(request.Latitude, request.Longitude) ? "" : OutOfOfficeOutWarning;
            string userNote = string.IsNullOrEmpty(request.Note) ? "" : $" | Out: {request.Note}";

            log.CheckOutTime = DateTime.Now;
            log.CheckOutIp = request.CheckOutIp;
            log.Note += systemWarning + userNote;

            // Tính toán công
            if (log.ShiftConfig != null)
            {
                CalculateAttendanceMetrics(log, log.ShiftConfig);
            }

            await _attendanceRepo.UpdateAsync(log);

            return _mapper.Map<AttendanceLogResponse>(log);
        }

        /// <summary>
        /// Lấy bảng công tổng hợp tháng của nhân viên 
        /// </summary>
        public async Task<MyTimesheetSummaryResponse> GetMyAttendanceLogsAsync(int employeeId, int month, int year)
        {
            var startDate = new DateTime(year, month, 1);
            var daysInMonth = DateTime.DaysInMonth(year, month);
            var monthEndDate = new DateTime(year, month, daysInMonth);

            var yesterday = DateTime.Today.AddDays(-1);
            var syncEndDate = monthEndDate < yesterday ? monthEndDate : yesterday;

            if (startDate <= syncEndDate)
            {
                await SyncMissingDataAsync(employeeId, startDate, syncEndDate);
            }

            var logs = await _attendanceRepo.GetByMonthAsync(employeeId, month, year);

            // Tính toán tổng hợp
            var actualHours = logs.Where(x => x.Status == AttendanceStatus.OnTime ||
                                              x.Status == AttendanceStatus.Late ||
                                              x.Status == AttendanceStatus.EarlyLeave)
                                  .Sum(x => x.WorkingHours ?? 0);

            var holidayHours = logs.Where(x => x.Status == AttendanceStatus.Holiday ||
                                               x.Status == AttendanceStatus.OnLeave)
                                   .Sum(x => x.WorkingHours ?? 0);

            var lateLogs = logs.Where(x => x.Status == AttendanceStatus.Late).ToList();
            var earlyLogs = logs.Where(x => x.Status == AttendanceStatus.EarlyLeave).ToList();

            var otRequests = await _otRepo.GetByEmployeeAndMonthAsync(employeeId, month, year);
            double totalOtHours = otRequests.Sum(x => x.ApprovedHours);

            var logResponses = _mapper.Map<List<AttendanceLogResponse>>(logs);

            foreach (var log in logResponses)
            {
                var matchedOt = otRequests.FirstOrDefault(o => o.Date.Date == log.WorkDate.Date);
                log.OvertimeHours = matchedOt != null ? matchedOt.ApprovedHours : 0;
            }

            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            if (activeShifts == null || !activeShifts.Any()) throw new Exception("Không có ca nào trong hệ thống.");

            int targetShiftId = 0;

            if (logs.Any(x => x.ShiftId > 0))
            {
                targetShiftId = logs
                    .Where(x => x.ShiftId > 0)
                    .GroupBy(x => x.ShiftId)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .FirstOrDefault();
            }
            else
            {
                int prevMonth = month == 1 ? 12 : month - 1;
                int prevYear = month == 1 ? year - 1 : year;

                var prevLogs = await _attendanceRepo.GetByMonthAsync(employeeId, prevMonth, prevYear);
                if (prevLogs.Any(x => x.ShiftId > 0))
                {
                    targetShiftId = prevLogs
                        .Where(x => x.ShiftId > 0)
                        .GroupBy(x => x.ShiftId)
                        .OrderByDescending(g => g.Count())
                        .Select(g => g.Key)
                        .FirstOrDefault();
                }
            }

            var employeeShift = activeShifts.FirstOrDefault(s => s.Id == targetShiftId)
                             ?? activeShifts.First();

            decimal standardDays = GetStandardWorkDays(year, month, employeeShift.WorkDays);

            return new MyTimesheetSummaryResponse
            {
                ActualWorkingHours = Math.Round(actualHours, 2),
                PaidLeaveHours = Math.Round(holidayHours, 2),
                TotalOvertimeHours = totalOtHours,
                LateCount = lateLogs.Count,
                TotalLateMinutes = lateLogs.Sum(x => x.LateMinutes),
                EarlyLeaveCount = earlyLogs.Count,
                TotalEarlyLeaveMinutes = earlyLogs.Sum(x => x.EarlyLeaveMinutes),
                MissingCheckOutCount = logs.Count(x => x.Status == AttendanceStatus.MissingCheckOut),
                AbsentCount = logs.Count(x => x.Status == AttendanceStatus.Absent),
                OnLeaveCount = logs.Count(x => x.Status == AttendanceStatus.OnLeave),

                StandardWorkingDays = (int)standardDays,

                Logs = logResponses
            };
        }

        #endregion

        #region Private Validation & Helper Methods (Dành cho CheckIn/CheckOut)

        private async Task ValidateNotPublicHolidayAsync(DateTime date)
        {
            var holiday = await _publicHolidayRepo.GetHolidayByDateAsync(date);
            if (holiday != null)
            {
                throw new InvalidOperationException($"Hôm nay là ngày nghỉ lễ ({holiday.HolidayName}). Bạn không thể chấm công!");
            }
        }

        private async Task HandleExistingActiveLogAsync(int employeeId)
        {
            var activeLog = await _attendanceRepo.GetActiveLogAsync(employeeId);
            if (activeLog == null) return;

            if (IsZombieLog(activeLog))
            {
                await CloseZombieLogAsync(activeLog);
            }
            else
            {
                string checkInStr = activeLog.CheckInTime?.ToString("HH:mm") ?? "không xác định";
                throw new InvalidOperationException($"Bạn đã check-in vào lúc {checkInStr} ngày {activeLog.WorkDate:dd/MM/yyyy}. Vui lòng check-out trước khi check-in lần tiếp theo!");
            }
        }

        private async Task<(ShiftConfig Shift, DateTime WorkDate)> DetermineShiftForCheckInAsync(DateTime now)
        {
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            if (activeShifts == null || !activeShifts.Any())
            {
                throw new InvalidOperationException("Không có ca làm việc mặc định đang hoạt động.");
            }

            foreach (var shift in activeShifts)
            {
                if (IsTimeInShiftWindow(now, now.Date, shift)) return (shift, now.Date);
                if (IsTimeInShiftWindow(now, now.Date.AddDays(-1), shift)) return (shift, now.Date.AddDays(-1));
            }

            throw new InvalidOperationException($"Không tìm thấy ca làm việc phù hợp lúc {now:HH:mm}. Vui lòng check-in đúng khung giờ!");
        }

        private void ValidateWorkDayForShift(ShiftConfig shift, DateTime workDate)
        {
            var workDays = shift.WorkDays.Split(',').Select(d => (DayOfWeek)(int.Parse(d))).ToList();
            if (!workDays.Contains(workDate.DayOfWeek))
            {
                throw new InvalidOperationException($"Ca {shift.ShiftName} không áp dụng cho ngày {workDate:dddd}. Vui lòng kiểm tra lại lịch làm việc!");
            }
        }

        private async Task ValidateDuplicateCheckInAsync(int employeeId, int shiftId, DateTime workDate)
        {
            var existingLog = await _attendanceRepo.GetLogByShiftAndDateAsync(employeeId, shiftId, workDate);
            if (existingLog != null)
            {
                throw new InvalidOperationException($"Bạn đã chấm công (Ngày công: {workDate:dd/MM/yyyy}) rồi!");
            }
        }

        private AttendanceLog CreateAttendanceLog(int employeeId, ShiftConfig shift, DateTime workDate, DateTime now, CheckInRequest request, string systemWarning)
        {
            var newLog = new AttendanceLog
            {
                EmployeeId = employeeId,
                ShiftId = shift.Id,
                WorkDate = workDate,
                CheckInTime = now,
                CheckInIp = request.CheckInIp,
                Note = (systemWarning + request.Note).Trim(),
                Status = AttendanceStatus.OnTime,
                WorkingHours = 0
            };

            var shiftStartTime = workDate.Add(shift.StartTime);
            var allowedLateTime = shiftStartTime.AddMinutes(shift.AllowedLateMinutes);

            if (now > allowedLateTime)
            {
                newLog.Status = AttendanceStatus.Late;
            }

            return newLog;
        }

        private async Task CloseZombieLogAsync(AttendanceLog log)
        {
            log.Status = AttendanceStatus.MissingCheckOut;
            log.Note = (log.Note + " | [System: Đóng ca tự động do quên Check-out]").Trim();
            await _attendanceRepo.UpdateAsync(log);
        }

        private bool IsZombieLog(AttendanceLog log)
        {
            if (log.CheckInTime == null) return true;
            return (DateTime.Now - log.CheckInTime.Value).TotalHours > MaxZombieLogHours;
        }

        #endregion

        #region Business Logic & Metrics Calculations

        private void CalculateAttendanceMetrics(AttendanceLog log, ShiftConfig shift)
        {
            if (log.CheckInTime == null || log.CheckOutTime == null) return;

            // 1. CHUẨN HÓA KHUNG GIỜ CA
            var shiftStart = log.WorkDate.Date.Add(shift.StartTime);
            var shiftEnd = log.WorkDate.Date.Add(shift.EndTime);
            if (shift.EndTime <= shift.StartTime) shiftEnd = shiftEnd.AddDays(1); // Ca đêm

            // 2. TÍNH GIỜ LÀM VIỆC HỢP LỆ
            var actualIn = log.CheckInTime.Value;
            var actualOut = log.CheckOutTime.Value;

            var effectiveIn = actualIn > shiftStart ? actualIn : shiftStart;
            var effectiveOut = actualOut < shiftEnd ? actualOut : shiftEnd;

            double totalValidHours = 0;
            if (effectiveOut > effectiveIn)
            {
                totalValidHours = (effectiveOut - effectiveIn).TotalHours;

                // 3. TRỪ GIỜ NGHỈ (OVERLAP BREAK TIME)
                if (shift.BreakStartTime.HasValue && shift.BreakEndTime.HasValue)
                {
                    var breakStart = log.WorkDate.Date.Add(shift.BreakStartTime.Value);
                    var breakEnd = log.WorkDate.Date.Add(shift.BreakEndTime.Value);

                    if (shift.BreakStartTime.Value < shift.StartTime) breakStart = breakStart.AddDays(1);
                    if (shift.BreakEndTime.Value < shift.BreakStartTime.Value) breakEnd = breakEnd.AddDays(1);

                    var overlapStart = effectiveIn > breakStart ? effectiveIn : breakStart;
                    var overlapEnd = effectiveOut < breakEnd ? effectiveOut : breakEnd;

                    if (overlapStart < overlapEnd)
                    {
                        totalValidHours -= (overlapEnd - overlapStart).TotalHours;
                    }
                }
            }

            // 4. CHỐT STATUS & MINUTES
            if (actualIn > shiftStart)
            {
                int lateMins = (int)(actualIn - shiftStart).TotalMinutes;
                if (lateMins > shift.AllowedLateMinutes)
                {
                    log.Status = AttendanceStatus.Late;
                    log.LateMinutes = lateMins;
                }
            }

            if (actualOut < shiftEnd)
            {
                int earlyMins = (int)(shiftEnd - actualOut).TotalMinutes;
                if (earlyMins > shift.AllowedEarlyLeaveMinutes)
                {
                    if (log.Status != AttendanceStatus.Late) log.Status = AttendanceStatus.EarlyLeave;
                    log.EarlyLeaveMinutes = earlyMins;
                }
            }

            log.WorkingHours = Math.Round(Math.Max(totalValidHours, 0), 2);
        }

        #endregion

        #region Utility Methods

        private bool IsTimeInShiftWindow(DateTime currentTime, DateTime shiftDate, ShiftConfig shift)
        {
            var start = shiftDate.Add(shift.StartTime);
            var end = shiftDate.Add(shift.EndTime);
            if (shift.EndTime < shift.StartTime) end = end.AddDays(1);

            return currentTime >= start.AddHours(-2) && currentTime <= end;
        }

        private async Task SyncMissingDataAsync(int employeeId, DateTime fromDate, DateTime toDate)
        {
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            var shift = activeShifts?.FirstOrDefault();
            if (shift == null) return;

            var workDaysList = string.IsNullOrEmpty(shift.WorkDays)
                ? new List<DayOfWeek>()
                : shift.WorkDays.Split(',').Select(d => (DayOfWeek)(int.Parse(d))).ToList();

            var existingLogs = await _attendanceRepo.GetByMonthAsync(employeeId, fromDate.Month, fromDate.Year);
            var existingDates = existingLogs.Select(x => x.WorkDate.Date).ToHashSet();
            var holidaysInMonth = await _publicHolidayRepo.GetHolidaysInRangeAsync(fromDate, toDate);
            var leavesInMonth = await _leaveRequestRepo.GetApprovedLeavesInRangeAsync(employeeId, fromDate, toDate);

            var logsToAdd = new List<AttendanceLog>();

            for (var date = fromDate; date <= toDate; date = date.AddDays(1))
            {
                if (existingDates.Contains(date.Date)) continue;

                bool isWorkingDay = workDaysList.Contains(date.DayOfWeek);
                var holiday = holidaysInMonth.FirstOrDefault(h => date.Date >= h.StartDate.Date && date.Date <= h.EndDate.Date);

                if (holiday != null)
                {
                    if (isWorkingDay)
                    {
                        logsToAdd.Add(CreateSystemLog(employeeId, shift.Id, date, AttendanceStatus.Holiday, $"[System: Nghỉ lễ {holiday.HolidayName}]", 8));
                    }
                    continue;
                }

                if (!isWorkingDay) continue;

                var approvedLeave = leavesInMonth.FirstOrDefault(l => date.Date >= l.StartDate.Date && date.Date <= l.EndDate.Date);
                if (approvedLeave != null)
                {
                    logsToAdd.Add(CreateSystemLog(employeeId, shift.Id, date, AttendanceStatus.OnLeave, $"[System: Nghỉ có phép] {approvedLeave.LeaveType?.Name}", 0));
                    continue;
                }

                logsToAdd.Add(CreateSystemLog(employeeId, shift.Id, date, AttendanceStatus.Absent, "[System: Vắng mặt không phép]", 0));
            }

            if (logsToAdd.Any()) await _attendanceRepo.AddRangeAsync(logsToAdd);
        }

        private AttendanceLog CreateSystemLog(int employeeId, int shiftId, DateTime workDate, AttendanceStatus status, string note, double workingHours)
        {
            return new AttendanceLog
            {
                EmployeeId = employeeId,
                ShiftId = shiftId,
                WorkDate = workDate,
                Status = status,
                IsSystemGenerated = true,
                Note = note,
                WorkingHours = workingHours
            };
        }

        private bool IsWithinOfficeRadius(double? userLat, double? userLon)
        {
            if (userLat == null || userLon == null) return false;

            var officeLocations = new List<(double Latitude, double Longitude)>
            {
                (21.065222, 105.715528), // Cơ sở Hoài Đức
                (21.014175, 105.525060), // ĐH FPT - Hòa Lạc
                (21.0296, 105.8553)      // Test Demo
            };

            foreach (var office in officeLocations)
            {
                var dLat = (userLat.Value - office.Latitude) * Math.PI / 180.0;
                var dLon = (userLon.Value - office.Longitude) * Math.PI / 180.0;

                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(office.Latitude * Math.PI / 180.0) * Math.Cos(userLat.Value * Math.PI / 180.0) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

                var distance = 6371000 * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));

                if (distance <= AllowedOfficeRadiusInMeters) return true;
            }

            return false;
        }

        private decimal GetStandardWorkDays(int year, int month, string workDaysConfig)
        {
            if (string.IsNullOrEmpty(workDaysConfig)) return 0;
            var allowedDays = workDaysConfig.Split(',').Select(d => (DayOfWeek)int.Parse(d)).ToList();

            int daysToCalculate = (year == DateTime.Now.Year && month == DateTime.Now.Month)
                ? DateTime.Now.Day
                : DateTime.DaysInMonth(year, month);

            int workDays = 0;
            for (int i = 1; i <= daysToCalculate; i++)
            {
                if (allowedDays.Contains(new DateTime(year, month, i).DayOfWeek)) workDays++;
            }
            return workDays;
        }

        #endregion
    }
}