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
        private readonly IMapper _mapper;

        public AttendanceService(
            IAttendanceRepository attendanceRepo,
            IShiftRepository shiftRepo,
            IPublicHolidayRepository publicHolidayRepo,
            IMapper mapper,
            IMonthlyTimesheetRepository monthlyTimesheetRepo,
            ILeaveRequestRepository leaveRequestRepo)
        {
            _attendanceRepo = attendanceRepo;
            _shiftRepo = shiftRepo;
            _publicHolidayRepo = publicHolidayRepo;
            _mapper = mapper;
            _monthlyTimesheetRepo = monthlyTimesheetRepo;
            _leaveRequestRepo = leaveRequestRepo;
        }
        public async Task<AttendanceLogResponse> CheckInAsync(int employeeId, CheckInRequest request)
        {
            var today = DateTime.Today;
            var now = DateTime.Now;

            // CHẶN CHECK-IN NGÀY LỄ ---
            var holiday = await _publicHolidayRepo.GetHolidayByDateAsync(today);
            if (holiday != null)
            {
                throw new InvalidOperationException($"Hôm nay là ngày nghỉ lễ ({holiday.HolidayName}). Bạn không thể chấm công!");
            }

            var activeLog = await _attendanceRepo.GetActiveLogAsync(employeeId);
            if (activeLog != null)
            {
                if (IsZombieLog(activeLog))
                {
                    activeLog.Status = AttendanceStatus.MissingCheckOut;
                    activeLog.Note = (activeLog.Note + " | [System: Đóng ca tự động do quên Check-out]").Trim();
                    await _attendanceRepo.UpdateAsync(activeLog);

                    activeLog = null;
                }
                else
                {
                    throw new InvalidOperationException($"Bạn đã check-in vào lúc {activeLog.CheckInTime:HH:mm} ngày {activeLog.WorkDate:dd/MM/yyyy}. Vui lòng check-out trước khi check-in lần tiếp theo!");
                }
            }
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            if (activeShifts == null)
            {
                throw new InvalidOperationException("Không có ca làm việc mặc định đang hoạt động.");
            }

            ShiftConfig? selectedShift = null;
            DateTime determinedWorkDate = now.Date;

            foreach (var shift in activeShifts)
            {
                // 1. Kịch bản A: Ca làm việc bắt đầu trong HÔM NAY (VD: Ca sáng 08:00)
                // Check window: Trước giờ làm 2 tiếng và sau giờ làm (Late + nửa ca)
                if (IsTimeInShiftWindow(now, now.Date, shift))
                {
                    selectedShift = shift;
                    determinedWorkDate = now.Date; // Công tính cho hôm nay
                    break;
                }

                // 2. Kịch bản B: Ca làm việc bắt đầu từ HÔM QUA (VD: Ca đêm 22:00 hôm qua -> 05:00 sáng nay)
                if (IsTimeInShiftWindow(now, now.Date.AddDays(-1), shift))
                {
                    selectedShift = shift;
                    determinedWorkDate = now.Date.AddDays(-1); // Công ngày hôm qua
                    break;
                }
            }

            if (selectedShift == null)
            {
                throw new Exception($"Không tìm thấy ca làm việc phù hợp lúc {now:HH:mm}. Vui lòng check-in đúng khung giờ!");

            }

            if (selectedShift != null)
            {
                var workDays = selectedShift.WorkDays.Split(',').Select(d => (DayOfWeek)(int.Parse(d))).ToList();
                int todayOfWeek = (int)now.DayOfWeek;
                if (!workDays.Contains((DayOfWeek)todayOfWeek))
                {
                    throw new InvalidOperationException($"Ca {selectedShift.ShiftName} không áp dụng cho ngày {now:dddd}. Vui lòng kiểm tra lại lịch làm việc!");
                }
            }

            var existingShiftLog = await _attendanceRepo.GetLogByShiftAndDateAsync(employeeId, selectedShift.Id, determinedWorkDate);
            if (existingShiftLog != null)
            {
                throw new InvalidOperationException($"Bạn đã chấm công cho {selectedShift.ShiftName} (Ngày công: {determinedWorkDate:dd/MM}) rồi!");
            }

            var newLog = new AttendanceLog
            {
                EmployeeId = employeeId,
                ShiftId = selectedShift.Id,
                WorkDate = today,
                CheckInTime = now,
                CheckInIp = request.CheckInIp,
                Note = request.Note,
                Status = AttendanceStatus.OnTime,
                WorkingHours = 0
            };

            //Tính toán đi muộn 
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
            if (!string.IsNullOrEmpty(request.Note)) log.Note += $" | Out: {request.Note}";

            if (log.ShiftConfig != null)
            {
                CalculateAttendanceMetrics(log, log.ShiftConfig);
            }

            await _attendanceRepo.UpdateAsync(log);

            return _mapper.Map<AttendanceLogResponse>(log);
        }

        private bool IsZombieLog(AttendanceLog log)
        {
            if (log.CheckInTime == null) return false;

            // Đặt hạn mức: Một ca làm việc tối đa không bao giờ vượt quá 16 tiếng.
            // Nếu đã quá 16 tiếng kể từ lúc Check-in mà chưa Check-out -> Coi như quên.
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

            return new MyTimesheetSummaryResponse
            {
                ActualWorkingHours = Math.Round(actualHours, 2),
                PaidLeaveHours = Math.Round(holidayHours, 2),

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
            // Lấy Shift mặc định để gán ID (bắt buộc phải có ShiftId mới lưu được log)
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            var shift = activeShifts?.FirstOrDefault();
            if (shift == null) return;

            var workDaysList = new List<DayOfWeek>();
            if (!string.IsNullOrEmpty(shift.WorkDays))
            {
                workDaysList = shift.WorkDays.Split(',')
                    .Select(d => (DayOfWeek)(int.Parse(d)))
                    .ToList();
            }

            var logsToAdd = new List<AttendanceLog>();

            // Vòng lặp quét từng ngày
            for (var date = fromDate; date <= toDate; date = date.AddDays(1))
            {
                // 0. Kiểm tra xem ngày này ĐÃ CÓ record nào trong DB chưa (bất kể status gì)
                bool hasLog = await _attendanceRepo.HasAttendanceAsync(employeeId, date);
                if (hasLog)
                {
                    // Nếu có rồi thì thôi, không ghi đè (Logic check MissingCheckout đã làm ở bước trước đó rồi)
                    continue;
                }

                bool isWorkingDay = workDaysList.Contains(date.DayOfWeek);

                // 1. ƯU TIÊN CAO NHẤT: KIỂM TRA NGÀY LỄ
                var holiday = await _publicHolidayRepo.GetHolidayByDateAsync(date);
                if (holiday != null)
                {
                    if (!isWorkingDay) continue;
                    logsToAdd.Add(new AttendanceLog
                    {
                        EmployeeId = employeeId,
                        ShiftId = shift.Id,
                        WorkDate = date,
                        Status = AttendanceStatus.Holiday, // <--- Status Nghỉ Lễ
                        IsSystemGenerated = true,
                        Note = $"[System: Nghỉ lễ {holiday.HolidayName}]",
                        WorkingHours = 8 // Thường nghỉ lễ vẫn được tính 8h công hưởng lương
                    });
                    continue; // Xong ngày này, nhảy sang ngày tiếp theo ngay
                }

                // 2. ƯU TIÊN NHÌ: CHECK NGAY LAM VIEC THEO SHIFT CONFIG
                if (!workDaysList.Contains(date.DayOfWeek))
                {
                    continue;
                }

                var approvedLeave = await _leaveRequestRepo.GetApprovedLeaveOnDateAsync(employeeId, date);
                if (approvedLeave != null)
                {
                    logsToAdd.Add(new AttendanceLog
                    {
                        EmployeeId = employeeId,
                        ShiftId = shift.Id,
                        WorkDate = date,
                        Status = AttendanceStatus.OnLeave, // Trạng thái 9: Nghỉ có phép
                        IsSystemGenerated = true,
                        Note = $"[System: Nghỉ có phép] {approvedLeave.LeaveType?.Name}",
                        WorkingHours = 0
                    });
                    continue;
                }

                // 3. CUỐI CÙNG: KHÔNG LỄ, KHÔNG CUỐI TUẦN, KHÔNG LOG -> VẮNG MẶT
                logsToAdd.Add(new AttendanceLog
                {
                    EmployeeId = employeeId,
                    ShiftId = shift.Id,
                    WorkDate = date,
                    Status = AttendanceStatus.Absent, // <--- Status Vắng
                    IsSystemGenerated = true,
                    Note = "[System: Vắng mặt không phép]",
                    WorkingHours = 0
                });
            }

            // Batch Insert
            if (logsToAdd.Any())
            {
                await _attendanceRepo.AddRangeAsync(logsToAdd);
            }
        }

        // Tính "Ngày công chuẩn" ĐỘNG dựa trên cấu hình Ca làm việc ---
        private decimal GetStandardWorkDays(int year, int month, string workDaysConfig)
        {
            if (string.IsNullOrEmpty(workDaysConfig)) return 0;

            var allowedDays = workDaysConfig.Split(',')
                                            .Select(d => (DayOfWeek)int.Parse(d))
                                            .ToList();

            int daysInMonth = DateTime.DaysInMonth(year, month);
            int workDays = 0;

            for (int i = 1; i <= daysInMonth; i++)
            {
                DateTime date = new DateTime(year, month, i);

                // Nếu ngày đó nằm trong danh sách WorkDays của ca làm việc -> Tính là 1 ngày công
                if (allowedDays.Contains(date.DayOfWeek))
                {
                    workDays++;
                }
            }
            return workDays;
        }

        // --- 2. HÀM CHÍNH: TỔNG HỢP CÔNG TOÀN CÔNG TY ---
        public async Task CalculateCompanyTimesheetAsync(int month, int year)
        {
            // Lấy ca làm việc mặc định đang Active để làm mốc tính ngày công chuẩn
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            var defaultShift = activeShifts?.FirstOrDefault();

            if (defaultShift == null)
            {
                throw new InvalidOperationException("Hệ thống chưa có Ca làm việc nào được kích hoạt để làm mốc tính công!");
            }

            decimal standardDays = GetStandardWorkDays(year, month, defaultShift.WorkDays);

            var allLogs = await _attendanceRepo.GetAllLogsByMonthAsync(month, year);

            var groupedByEmployee = allLogs.GroupBy(x => x.EmployeeId);

            var timesheetsToAdd = new List<MonthlyTimesheet>();
            var timesheetsToUpdate = new List<MonthlyTimesheet>();

            foreach (var group in groupedByEmployee)
            {
                int empId = group.Key;
                var logs = group.ToList();

                // Đếm ngày làm thực tế (Đúng giờ, Đi muộn, Về sớm)
                decimal actualWorkDays = logs.Count(x =>
                    x.Status == AttendanceStatus.OnTime ||
                    x.Status == AttendanceStatus.Late ||
                    x.Status == AttendanceStatus.EarlyLeave);

                // Đếm ngày nghỉ (Có phép/Lễ và Không phép/Quên chấm)
                decimal paidLeaveDays = logs.Count(x =>
                    x.Status == AttendanceStatus.Holiday ||
                    x.Status == AttendanceStatus.OnLeave);
                decimal loggedUnpaidLeave = logs.Count(x =>
                    x.Status == AttendanceStatus.Absent ||
                    x.Status == AttendanceStatus.MissingCheckOut);

                decimal totalAccountedDays = actualWorkDays + paidLeaveDays + loggedUnpaidLeave;
                decimal missingDays = standardDays - totalAccountedDays;

                decimal unpaidLeaveDays = loggedUnpaidLeave + (missingDays > 0 ? missingDays : 0);

                double totalHours = Math.Round(logs.Where(x =>
                                            x.Status == AttendanceStatus.OnTime ||
                                            x.Status == AttendanceStatus.Late ||
                                            x.Status == AttendanceStatus.EarlyLeave)
                                        .Sum(x => x.WorkingHours ?? 0), 2);

                int totalLateMins = logs.Sum(x => x.LateMinutes);
                int totalEarlyMins = logs.Sum(x => x.EarlyLeaveMinutes);

                // TÌM XEM BẢNG CÔNG THÁNG CỦA NHÂN VIÊN NÀY ĐÃ TỒN TẠI CHƯA
                var existingRecord = await _monthlyTimesheetRepo.GetByEmployeeAndMonthAsync(empId, month, year);

                if (existingRecord != null)
                {
                    // Nếu đã Khóa sổ (Locked) thì TUYỆT ĐỐI KHÔNG GHI ĐÈ, bỏ qua luôn!
                    if (existingRecord.Status == TimesheetStatus.Locked) continue;

                    existingRecord.StandardWorkDays = standardDays;
                    existingRecord.ActualWorkDays = actualWorkDays;
                    existingRecord.PaidLeaveDays = paidLeaveDays;
                    existingRecord.UnpaidLeaveDays = unpaidLeaveDays;
                    existingRecord.TotalWorkingHours = totalHours;
                    existingRecord.TotalLateMinutes = totalLateMins;
                    existingRecord.TotalEarlyLeaveMinutes = totalEarlyMins;

                    existingRecord.LastCalculatedDate = DateTime.Now;
                    existingRecord.Status = TimesheetStatus.Draft; // Set về Draft (Bản nháp)

                    timesheetsToUpdate.Add(existingRecord);
                }
                else
                {
                    timesheetsToAdd.Add(new MonthlyTimesheet
                    {
                        EmployeeID = empId,
                        Month = month,
                        Year = year,
                        StandardWorkDays = standardDays,
                        ActualWorkDays = actualWorkDays,
                        PaidLeaveDays = paidLeaveDays,
                        UnpaidLeaveDays = unpaidLeaveDays,
                        TotalWorkingHours = totalHours,
                        TotalLateMinutes = totalLateMins,
                        TotalEarlyLeaveMinutes = totalEarlyMins,
                        Status = TimesheetStatus.Draft,
                        LastCalculatedDate = DateTime.Now
                    });
                }
            }

            // BULK INSERT / UPDATE
            if (timesheetsToAdd.Any()) await _monthlyTimesheetRepo.AddRangeAsync(timesheetsToAdd);
            if (timesheetsToUpdate.Any()) await _monthlyTimesheetRepo.UpdateRangeAsync(timesheetsToUpdate);
        }
    }
}