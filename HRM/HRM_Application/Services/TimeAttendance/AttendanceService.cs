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
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class AttendanceService : IAttendanceService
    {

        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IShiftRepository _shiftRepo;
        private readonly IPublicHolidayRepository _publicHolidayRepo;
        private readonly IMonthlyTimesheetRepository _monthlyTimesheetRepo;
        private readonly ILeaveRequestRepository _leaveRequestRepo;
        private readonly IOvertimeRequestRepository _otRepo;
        private readonly IMapper _mapper;

        public AttendanceService(
            IAttendanceRepository attendanceRepo,
            IShiftRepository shiftRepo,
            IPublicHolidayRepository publicHolidayRepo,
            IMapper mapper,
            IMonthlyTimesheetRepository monthlyTimesheetRepo,
            ILeaveRequestRepository leaveRequestRepo,
            IOvertimeRequestRepository otRepo)
        {
            _attendanceRepo = attendanceRepo;
            _shiftRepo = shiftRepo;
            _publicHolidayRepo = publicHolidayRepo;
            _mapper = mapper;
            _monthlyTimesheetRepo = monthlyTimesheetRepo;
            _leaveRequestRepo = leaveRequestRepo;
            _otRepo = otRepo;
        }
        public async Task<AttendanceLogResponse> CheckInAsync(int employeeId, CheckInRequest request)
        {
            var today = DateTime.Today;
            var now = DateTime.Now;

            bool isInsideOffice = IsWithinOfficeRadius(request.Latitude, request.Longitude);
            string systemWarning = "";

            if (!isInsideOffice)
            {
                systemWarning = "[⚠️ CẢNH BÁO: Chấm công ngoài phạm vi văn phòng hoặc không có GPS] ";
            }

            // 1. CHẶN CHECK-IN NGÀY LỄ
            var holiday = await _publicHolidayRepo.GetHolidayByDateAsync(today);
            if (holiday != null)
            {
                throw new InvalidOperationException($"Hôm nay là ngày nghỉ lễ ({holiday.HolidayName}). Bạn không thể chấm công!");
            }

            // 2. KIỂM TRA LOG CŨ CHƯA CHECK-OUT
            var activeLog = await _attendanceRepo.GetActiveLogAsync(employeeId);
            if (activeLog != null)
            {
                if (IsZombieLog(activeLog))
                {
                    activeLog.Status = AttendanceStatus.MissingCheckOut;
                    activeLog.Note = (activeLog.Note + " | [System: Đóng ca tự động do quên Check-out]").Trim();
                    await _attendanceRepo.UpdateAsync(activeLog);
                }
                else
                {
                    // [FIX LỖI HIỂN THỊ]: Bắt trường hợp CheckInTime bị NULL dưới Database
                    string checkInStr = activeLog.CheckInTime?.ToString("HH:mm") ?? "không xác định";
                    throw new InvalidOperationException($"Bạn đã check-in vào lúc {checkInStr} ngày {activeLog.WorkDate:dd/MM/yyyy}. Vui lòng check-out trước khi check-in lần tiếp theo!");
                }
            }

            // 3. TÌM CA LÀM VIỆC PHÙ HỢP
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            if (activeShifts == null || !activeShifts.Any())
            {
                throw new InvalidOperationException("Không có ca làm việc mặc định đang hoạt động.");
            }

            ShiftConfig? selectedShift = null;
            DateTime determinedWorkDate = now.Date;

            foreach (var shift in activeShifts)
            {
                if (IsTimeInShiftWindow(now, now.Date, shift))
                {
                    selectedShift = shift;
                    determinedWorkDate = now.Date;
                    break;
                }

                if (IsTimeInShiftWindow(now, now.Date.AddDays(-1), shift))
                {
                    selectedShift = shift;
                    determinedWorkDate = now.Date.AddDays(-1);
                    break;
                }
            }

            if (selectedShift == null)
            {
                throw new InvalidOperationException($"Không tìm thấy ca làm việc phù hợp lúc {now:HH:mm}. Vui lòng check-in đúng khung giờ!");
            }

            // 4. KIỂM TRA NGÀY ĐƯỢC PHÉP LÀM VIỆC CỦA CA
            var workDays = selectedShift.WorkDays.Split(',').Select(d => (DayOfWeek)(int.Parse(d))).ToList();
            // [FIX BUG LOGIC]: Phải lấy DayOfWeek của ca làm việc, không lấy thời gian hiện tại để tránh sai số ca đêm
            var shiftDayOfWeek = determinedWorkDate.DayOfWeek;

            if (!workDays.Contains(shiftDayOfWeek))
            {
                throw new InvalidOperationException($"Ca {selectedShift.ShiftName} không áp dụng cho ngày {determinedWorkDate:dddd}. Vui lòng kiểm tra lại lịch làm việc!");
            }

            // 5. KIỂM TRA CHỐNG TRÙNG CHẤM CÔNG TRONG NGÀY
            var existingShiftLog = await _attendanceRepo.GetLogByShiftAndDateAsync(employeeId, selectedShift.Id, determinedWorkDate);
            if (existingShiftLog != null)
            {
                throw new InvalidOperationException($"Bạn đã chấm công cho {selectedShift.ShiftName} (Ngày công: {determinedWorkDate:dd/MM/yyyy}) rồi!");
            }

            // 6. TẠO LOG MỚI
            var newLog = new AttendanceLog
            {
                EmployeeId = employeeId,
                ShiftId = selectedShift.Id,
                WorkDate = determinedWorkDate, // [FIX BUG LOGIC]: Lưu đúng ngày ca làm việc, không dùng "today"
                CheckInTime = now,
                CheckInIp = request.CheckInIp,
                Note = (systemWarning + request.Note).Trim(),
                Status = AttendanceStatus.OnTime,
                WorkingHours = 0
            };

            // 7. TÍNH TOÁN ĐI MUỘN
            var shiftStartTime = determinedWorkDate.Add(selectedShift.StartTime);
            var allowedLateTime = shiftStartTime.AddMinutes(selectedShift.AllowedLateMinutes);

            if (now > allowedLateTime)
            {
                newLog.Status = AttendanceStatus.Late;
            }

            await _attendanceRepo.AddAsync(newLog);

            var response = _mapper.Map<AttendanceLogResponse>(newLog);
            response.ShiftName = selectedShift.ShiftName;
            return response;
        }

        public async Task<AttendanceLogResponse> CheckOutAsync(int employeeId, CheckOutRequest request)
        {
            var today = DateTime.Today;

            bool isInsideOffice = IsWithinOfficeRadius(request.Latitude, request.Longitude);
            string systemWarning = "";

            if (!isInsideOffice)
            {
                systemWarning = " | [⚠️ Out: Ngoài phạm vi]";
            }

            var log = await _attendanceRepo.GetActiveLogAsync(employeeId);
            if (log == null)
            {
                throw new Exception("Bạn chưa check-in, không thể check-out!");
            }

            if (IsZombieLog(log))
            {
                log.Status = AttendanceStatus.MissingCheckOut;
                log.Note = (log.Note + " | [System: Đóng ca tự động do quá hạn Check-out]").Trim();
                await _attendanceRepo.UpdateAsync(log);

                throw new InvalidOperationException($"Ca làm việc ngày {log.WorkDate:dd/MM} đã quá hạn để Check-out. Hệ thống đã tự động chốt là 'Quên Check-out'!");
            }

            log.CheckOutTime = DateTime.Now;
            log.CheckOutIp = request.CheckOutIp;
            string userNote = string.IsNullOrEmpty(request.Note) ? "" : $" | Out: {request.Note}";
            log.Note += systemWarning + userNote;

            if (log.ShiftConfig != null)
            {
                CalculateAttendanceMetrics(log, log.ShiftConfig);
            }

            await _attendanceRepo.UpdateAsync(log);

            return _mapper.Map<AttendanceLogResponse>(log);
        }
        private bool IsZombieLog(AttendanceLog log)
        {
            // Dữ liệu rác (Không có giờ vào), hoặc không có ngày công 
            if (log.CheckInTime == null) return true;

            // Nếu đã quá 16 tiếng kể từ lúc Check-in mà chưa Check-out -> Quên Check-out
            return (DateTime.Now - log.CheckInTime.Value).TotalHours > 16;
        }

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

            var actualHours = logs.Where(x => x.Status == AttendanceStatus.OnTime ||
                                              x.Status == AttendanceStatus.Late ||
                                              x.Status == AttendanceStatus.EarlyLeave)
                                  .Sum(x => x.WorkingHours ?? 0);

            var holidayHours = logs.Where(x => x.Status == AttendanceStatus.Holiday ||
                                       x.Status == AttendanceStatus.OnLeave)
                           .Sum(x => x.WorkingHours ?? 0);

            var lateLogs = logs.Where(x => x.Status == AttendanceStatus.Late).ToList();
            var earlyLogs = logs.Where(x => x.Status == AttendanceStatus.EarlyLeave).ToList();

            // Lấy toàn bộ đơn xin OT của nhân viên này trong tháng
            var otRequests = await _otRepo.GetByEmployeeAndMonthAsync(employeeId, month, year);

            // Chỉ cộng dồn số giờ của những đơn ĐÃ ĐƯỢC DUYỆT (Status = Approved)
            double totalOtHours = otRequests
                .Where(x => x.Status == ExplanationStatus.Approved)
                .Sum(x => x.ApprovedHours);

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

                Logs = _mapper.Map<List<AttendanceLogResponse>>(logs)
            };
        }

        // --- Helper: Logic tính công ---
        private void CalculateAttendanceMetrics(AttendanceLog log, ShiftConfig shift)
        {
            // Guard clause: Nếu chưa có đủ In/Out thì không thể tính công
            if (log.CheckInTime == null || log.CheckOutTime == null) return;

            // =========================================================================
            // 1. CHUẨN HÓA KHUNG GIỜ CA LÀM VIỆC (SHIFT BOUNDARIES)
            // =========================================================================
            var shiftStart = log.WorkDate.Date.Add(shift.StartTime);
            var shiftEnd = log.WorkDate.Date.Add(shift.EndTime);

            // Xử lý Ca Đêm: Nếu giờ kết thúc nhỏ hơn giờ bắt đầu -> vắt qua ngày hôm sau
            if (shift.EndTime <= shift.StartTime)
            {
                shiftEnd = shiftEnd.AddDays(1);
            }

            // =========================================================================
            // 2. XÁC ĐỊNH THỜI GIAN LÀM VIỆC HỢP LỆ (EFFECTIVE WORKING TIME)
            // =========================================================================
            var actualIn = log.CheckInTime.Value;
            var actualOut = log.CheckOutTime.Value;

            // Ép mốc thời gian vào khung ca để chặn việc đi quá sớm hoặc nán lại quá muộn
            // Đi sớm hơn ca -> tính từ lúc bắt đầu ca. Về muộn hơn ca -> tính đến lúc kết thúc ca.
            var effectiveIn = actualIn > shiftStart ? actualIn : shiftStart;
            var effectiveOut = actualOut < shiftEnd ? actualOut : shiftEnd;

            double totalValidHours = 0;

            // Chỉ tính công nếu khoảng thời gian hợp lệ lớn hơn 0 (Tránh lỗi check-in sau khi ca đã kết thúc)
            if (effectiveOut > effectiveIn)
            {
                totalValidHours = (effectiveOut - effectiveIn).TotalHours;

                // =====================================================================
                // 3. TRỪ THỜI GIAN NGHỈ GIỮA CA (BREAK TIME OVERLAP CALCULATION)
                // =====================================================================
                if (shift.BreakStartTime.HasValue && shift.BreakEndTime.HasValue)
                {
                    var breakStart = log.WorkDate.Date.Add(shift.BreakStartTime.Value);
                    var breakEnd = log.WorkDate.Date.Add(shift.BreakEndTime.Value);

                    // Xử lý ca đêm cho mốc giờ nghỉ
                    if (shift.BreakStartTime.Value < shift.StartTime) breakStart = breakStart.AddDays(1);
                    if (shift.BreakEndTime.Value < shift.BreakStartTime.Value) breakEnd = breakEnd.AddDays(1);

                    // TÌM VÙNG GIAO NHAU (OVERLAP) giữa [Giờ làm việc] và [Giờ nghỉ]
                    var overlapStart = effectiveIn > breakStart ? effectiveIn : breakStart;
                    var overlapEnd = effectiveOut < breakEnd ? effectiveOut : breakEnd;

                    // Nếu có giao nhau, trừ đi đúng phần số giờ bị trùng
                    if (overlapStart < overlapEnd)
                    {
                        totalValidHours -= (overlapEnd - overlapStart).TotalHours;
                    }
                }
            }

            // =========================================================================
            // 4. CHỐT SỐ GIỜ CÔNG & XÉT TRẠNG THÁI (FINALIZE)
            // =========================================================================

            // 4.1 TÍNH PHÚT ĐI MUỘN (Dựa vào actualIn so với shiftStart)
            if (actualIn > shiftStart)
            {
                int lateMins = (int)(actualIn - shiftStart).TotalMinutes;
                if (lateMins > shift.AllowedLateMinutes)
                {
                    log.Status = AttendanceStatus.Late;
                    log.LateMinutes = lateMins;
                }
            }

            // 4.2 TÍNH PHÚT VỀ SỚM (Dựa vào actualOut so với shiftEnd)
            if (actualOut < shiftEnd)
            {
                int earlyMins = (int)(shiftEnd - actualOut).TotalMinutes;
                if (earlyMins > shift.AllowedEarlyLeaveMinutes)
                {
                    // Nếu đã dính trạng thái Đi muộn thì giữ nguyên Status là Late, nhưng vẫn ghi nhận số phút về sớm
                    if (log.Status != AttendanceStatus.Late)
                    {
                        log.Status = AttendanceStatus.EarlyLeave;
                    }
                    log.EarlyLeaveMinutes = earlyMins;
                }
            }

            // Đảm bảo không bao giờ bị số âm, làm tròn 2 chữ số thập phân
            log.WorkingHours = Math.Round(Math.Max(totalValidHours, 0), 2);

            // Logic xét Về Sớm (Early Leave)
            var allowedEarlyTime = shiftEnd.AddMinutes(-shift.AllowedEarlyLeaveMinutes);

            // Lưu ý: Dùng `actualOut` để xét về sớm, vì ta cần biết thực tế họ bước ra khỏi công ty lúc nào
            if (actualOut < allowedEarlyTime && log.Status != AttendanceStatus.Late)
            {
                log.Status = AttendanceStatus.EarlyLeave;
            }
        }

        private bool IsTimeInShiftWindow(DateTime currentTime, DateTime shiftDate, ShiftConfig shift)
        {
            // Giờ bắt đầu ca
            var start = shiftDate.Add(shift.StartTime);

            // Giờ kết thúc ca
            // Lưu ý: Nếu EndTime < StartTime (VD: 22h -> 05h) thì EndTime phải cộng thêm 1 ngày
            var end = shiftDate.Add(shift.EndTime);
            if (shift.EndTime < shift.StartTime)
            {
                end = end.AddDays(1);
            }

            var minStart = start.AddHours(-2);

            var maxStart = end;

            return currentTime >= minStart && currentTime <= maxStart;
        }

        private async Task SyncMissingDataAsync(int employeeId, DateTime fromDate, DateTime toDate)
        {
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            var shift = activeShifts?.FirstOrDefault();
            if (shift == null) return;

            var workDaysList = string.IsNullOrEmpty(shift.WorkDays)
                ? new List<DayOfWeek>()
                : shift.WorkDays.Split(',').Select(d => (DayOfWeek)(int.Parse(d))).ToList();

            // 1. Lấy tất cả log chấm công trong tháng
            var existingLogs = await _attendanceRepo.GetByMonthAsync(employeeId, fromDate.Month, fromDate.Year);
            var existingDates = existingLogs.Select(x => x.WorkDate.Date).ToHashSet();

            // 2. Lấy tất cả ngày lễ trong khoảng thời gian này
            var holidaysInMonth = await _publicHolidayRepo.GetHolidaysInRangeAsync(fromDate, toDate);

            // 3. Lấy tất cả đơn xin nghỉ có phép trong tháng
            var leavesInMonth = await _leaveRequestRepo.GetApprovedLeavesInRangeAsync(employeeId, fromDate, toDate);

            var logsToAdd = new List<AttendanceLog>();

            for (var date = fromDate; date <= toDate; date = date.AddDays(1))
            {
                if (existingDates.Contains(date.Date)) continue;

                bool isWorkingDay = workDaysList.Contains(date.DayOfWeek);

                // 1. KIỂM TRA NGÀY LỄ (Kiểm tra trong list RAM)
                var holiday = holidaysInMonth.FirstOrDefault(h => date.Date >= h.StartDate.Date && date.Date <= h.EndDate.Date);
                if (holiday != null)
                {
                    if (!isWorkingDay) continue;
                    logsToAdd.Add(new AttendanceLog
                    {
                        EmployeeId = employeeId,
                        ShiftId = shift.Id,
                        WorkDate = date,
                        Status = AttendanceStatus.Holiday,
                        IsSystemGenerated = true,
                        Note = $"[System: Nghỉ lễ {holiday.HolidayName}]",
                        WorkingHours = 8
                    });
                    continue;
                }

                if (!isWorkingDay) continue;

                // 2. CHECK XIN NGHỈ PHÉP 
                var approvedLeave = leavesInMonth.FirstOrDefault(l => date.Date >= l.StartDate.Date && date.Date <= l.EndDate.Date);
                if (approvedLeave != null)
                {
                    logsToAdd.Add(new AttendanceLog
                    {
                        EmployeeId = employeeId,
                        ShiftId = shift.Id,
                        WorkDate = date,
                        Status = AttendanceStatus.OnLeave,
                        IsSystemGenerated = true,
                        Note = $"[System: Nghỉ có phép] {approvedLeave.LeaveType?.Name}",
                        WorkingHours = 0
                    });
                    continue;
                }

                // 3. KHÔNG CÓ GÌ CẢ -> VẮNG MẶT
                logsToAdd.Add(new AttendanceLog
                {
                    EmployeeId = employeeId,
                    ShiftId = shift.Id,
                    WorkDate = date,
                    Status = AttendanceStatus.Absent,
                    IsSystemGenerated = true,
                    Note = "[System: Vắng mặt không phép]",
                    WorkingHours = 0
                });
            }

            if (logsToAdd.Any()) await _attendanceRepo.AddRangeAsync(logsToAdd);
        }
        
        private bool IsWithinOfficeRadius(double? userLat, double? userLon)
        {
            // Nếu thiết bị không gửi lên tọa độ (Do user chặn quyền GPS)
            if (userLat == null || userLon == null) return false;

            var officeLocations = new List<(double Latitude, double Longitude, string Name)>
                {
                    // Cơ sở 1: Hoài Đức, Hà Nội (Đã chuyển đổi sang hệ thập phân)
                    (21.065222, 105.715528, "Cơ sở Hoài Đức"),
        
                    // Cơ sở 2: Tòa Delta, Đại học FPT, Hòa Lạc
                    (21.014175, 105.525060, "Đại học FPT - Tòa Delta"),
                    (21.0296, 105.8553, "Vị trí Test Demo")
                };

            double allowedRadiusInMeters = 100.0;

            //KIỂM TRA QUÉT QUA TỪNG CƠ SỞ
            foreach (var office in officeLocations)
            {
                // tính khoảng cách
                var dLat = (userLat.Value - office.Latitude) * Math.PI / 180.0;
                var dLon = (userLon.Value - office.Longitude) * Math.PI / 180.0;

                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(office.Latitude * Math.PI / 180.0) * Math.Cos(userLat.Value * Math.PI / 180.0) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                var distance = 6371000 * c;

                if (distance <= allowedRadiusInMeters)
                {
                    return true;
                }
            }

            return false;
        }
    }
}