using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.TimeAttendance;
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
        private readonly IMapper _mapper;

        public AttendanceService(IAttendanceRepository attendanceRepo, IShiftRepository shiftRepo, IPublicHolidayRepository publicHolidayRepo, IMapper mapper)
        {
            _attendanceRepo = attendanceRepo;
            _shiftRepo = shiftRepo;
            _publicHolidayRepo = publicHolidayRepo;
            _mapper = mapper;
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

            // CHẶN CHECK-IN CUỐI TUẦN ---
            if (today.DayOfWeek == DayOfWeek.Sunday || today.DayOfWeek == DayOfWeek.Saturday)
            {
                throw new InvalidOperationException("Hôm nay là ngày nghỉ cuối tuần. Hệ thống không nhận chấm công!");
            }

            var existingLog = await _attendanceRepo.GetByDateAsync(employeeId, today);
            if (existingLog != null)
            {
                throw new InvalidOperationException("Đã chấm công.");
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

            // 1. Lấy bản ghi Check-in cũ
            var log = await _attendanceRepo.GetByDateAsync(employeeId, today);
            if (log == null)
            {
                throw new Exception("Bạn chưa check-in, không thể check-out!");
            }

            // 2. Cập nhật dữ liệu
            log.CheckOutTime = DateTime.Now;
            log.CheckOutIp = request.CheckOutIp;
            if (!string.IsNullOrEmpty(request.Note)) log.Note += $" | Out: {request.Note}";

            // 3. Tính toán công (Logic tách hàm private như cũ)
            // Vì Repository đã Include ShiftConfig nên log.ShiftConfig sẽ có dữ liệu
            if (log.ShiftConfig != null)
            {
                CalculateAttendanceMetrics(log, log.ShiftConfig);
            }

            // 4. Update qua Repository
            await _attendanceRepo.UpdateAsync(log);

            return _mapper.Map<AttendanceLogResponse>(log);
        }

        public async Task<List<AttendanceLogResponse>> GetMyAttendanceLogsAsync(int employeeId, int month, int year)
        {
            // --- BƯỚC 1: TÍNH TOÁN KHOẢNG THỜI GIAN CHUẨN ---
            var startDate = new DateTime(year, month, 1);

            // Tìm ngày cuối cùng của tháng đang xem (VD: 28/02 hoặc 31/10)
            var daysInMonth = DateTime.DaysInMonth(year, month);
            var monthEndDate = new DateTime(year, month, daysInMonth);

            // Mốc kết thúc quét = Min(Cuối tháng đó, Ngày hôm qua)
            // Nghĩa là: 
            // - Nếu xem quá khứ (T10/2025) -> Quét đến 31/10/2025.
            // - Nếu xem hiện tại (T02/2026) -> Quét đến hôm qua.
            var yesterday = DateTime.Today.AddDays(-1);
            var syncEndDate = monthEndDate < yesterday ? monthEndDate : yesterday;

            // Chỉ quét nếu ngày bắt đầu <= ngày kết thúc quét
            if (startDate <= syncEndDate)
            {
                await SyncMissingDataAsync(employeeId, startDate, syncEndDate);
            }

            // --- BƯỚC 2: LẤY DỮ LIỆU ---
            var logs = await _attendanceRepo.GetByMonthAsync(employeeId, month, year);
            return _mapper.Map<List<AttendanceLogResponse>>(logs);
        }

        // --- Helper: Logic tính công ---
        private void CalculateAttendanceMetrics(AttendanceLog log, ShiftConfig shift)
        {
            if (log.CheckInTime == null || log.CheckOutTime == null) return;

            var checkIn = log.CheckInTime.Value;
            var checkOut = log.CheckOutTime.Value;
            var duration = checkOut - checkIn;
            double totalHours = duration.TotalHours;

            // Trừ giờ nghỉ trưa
            if (shift.BreakStartTime.HasValue && shift.BreakEndTime.HasValue)
            {
                var breakStart = log.WorkDate.Add(shift.BreakStartTime.Value);
                var breakEnd = log.WorkDate.Add(shift.BreakEndTime.Value);

                // Nếu làm xuyên qua giờ nghỉ mới trừ
                if (checkIn < breakStart && checkOut > breakEnd)
                {
                    totalHours -= (breakEnd - breakStart).TotalHours;
                }
            }

            log.WorkingHours = Math.Round(totalHours > 0 ? totalHours : 0, 2);

            // Logic về sớm
            var shiftEndTime = log.WorkDate.Add(shift.EndTime);
            var allowedEarlyTime = shiftEndTime.AddMinutes(-shift.AllowedEarlyLeaveMinutes);

            if (checkOut < allowedEarlyTime && log.Status != AttendanceStatus.Late)
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
            if (!string.IsNullOrEmpty(shift.WorkDays)) {
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
    }
}
