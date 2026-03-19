using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Leave;
using HRM_Application.Interfaces.Repositories;
using HRM_Application.Interfaces.Services;
using HRM_Domain.Entities;
using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly ILeaveBalanceService _leaveBalanceService;
        private readonly ILeaveBalanceRepository _leaveBalanceRepo;
        private readonly ILeaveTypeRepository _leaveTypeRepo;
        private readonly ILeaveRequestRepository _leaveRequestRepo;
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IPublicHolidayRepository _holidayRepo;
        private readonly IShiftRepository _shiftRepo;

        public LeaveService(
            ILeaveBalanceService leaveBalanceService,
            ILeaveBalanceRepository leaveBalanceRepo,
            ILeaveTypeRepository leaveTypeRepo,
            ILeaveRequestRepository leaveRequestRepo,
            IAttendanceRepository attendanceRepo,
            IEmployeeRepository employeeRepo,
            IPublicHolidayRepository holidayRepo,
            IShiftRepository shiftRepo)
        {
            _leaveBalanceService = leaveBalanceService;
            _leaveBalanceRepo = leaveBalanceRepo;
            _leaveTypeRepo = leaveTypeRepo;
            _leaveRequestRepo = leaveRequestRepo;
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
            _holidayRepo = holidayRepo;
            _shiftRepo = shiftRepo;
        }

        public async Task<List<LeaveBalanceDto>> GetMyBalancesAsync(int employeeId, int year)
        {
            var balances = await _leaveBalanceRepo.GetBalancesByEmployeeAsync(employeeId, year);
            return balances.Select(x => new LeaveBalanceDto
            {
                LeaveTypeId = x.LeaveTypeId,
                LeaveTypeName = x.LeaveType?.Name ?? "Không xác định",
                TotalDays = x.TotalDays,
                UsedDays = x.UsedDays
            }).ToList();
        }

        public async Task<List<LeaveType>> GetLeaveTypesAsync()
        {
            return await _leaveTypeRepo.GetAllAsync();
        }

        public async Task<LeaveRequest> SubmitLeaveRequestAsync(int employeeId, CreateLeaveRequestDto dto)
        {
            if (dto.StartDate.Date > dto.EndDate.Date)
                throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");

            // Giới hạn xin nghỉ bù quá khứ (không quá 3 ngày)
            if (dto.StartDate.Date < DateTime.Now.Date.AddDays(-3))
                throw new ArgumentException("Bạn chỉ được phép làm đơn xin nghỉ bù tối đa cho 3 ngày trước đó.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(employeeId);
            if (employee == null) throw new KeyNotFoundException("Không tìm thấy thông tin nhân viên.");
            if (employee.ManagerID == null)
                throw new InvalidOperationException("Bạn chưa được gán Sếp quản lý trực tiếp. Vui lòng liên hệ HR.");

            // Tính số ngày nghỉ thực tế (Skip T7, CN, Lễ)
            double actualLeaveDays = await CalculateActualLeaveDaysAsync(dto.StartDate, dto.EndDate);

            if (actualLeaveDays <= 0)
                throw new InvalidOperationException("Khoảng thời gian bạn chọn rơi vào ngày nghỉ cuối tuần hoặc Lễ. Không cần nộp đơn.");

            // thoi gian báo trước
            double daysInAdvance = (dto.StartDate.Date - DateTime.Now.Date).TotalDays;
            
            // Nếu không phải là nghỉ bù quá khứ (daysInAdvance >= 0) thì mới check 
            if (daysInAdvance >= 0) 
            {
                if (actualLeaveDays >= 3 && daysInAdvance < 7)
                    throw new InvalidOperationException($"Nghỉ dài hạn ({actualLeaveDays} ngày) yêu cầu báo trước ít nhất 7 ngày. Bạn mới báo trước {daysInAdvance} ngày.");
                
                if (actualLeaveDays < 3 && daysInAdvance < 1)
                    throw new InvalidOperationException("Nghỉ phép thông thường yêu cầu báo trước ít nhất 1 ngày (24h).");
            }

            // Validate Quỹ phép chặn cứng
            var balance = await _leaveBalanceService.GetByEmployeeAndYearAsync(employeeId, dto.LeaveTypeId, dto.StartDate.Year);
            if (balance == null)
                throw new InvalidOperationException("Bạn chưa được cấp quỹ phép cho năm nay.");

            if (balance.RemainingDays < actualLeaveDays)
                throw new InvalidOperationException($"Không đủ ngày phép. Bạn còn {balance.RemainingDays} ngày, nhưng xin nghỉ {actualLeaveDays} ngày thực tế.");

            //Phân cấp duyệt đơn
            // Nếu nghỉ >= 3 ngày -> Manager duyệt xong chuyển HR. Nếu < 3 ngày -> Manager duyệt là chốt.
            bool requiresHrApproval = actualLeaveDays >= 3;

            var request = new LeaveRequest
            {
                EmployeeId = employeeId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                ManagerId = employee.ManagerID.Value,
                Status = ExplanationStatus.PendingManager,
                CreatedAt = DateTime.Now,
                ManagerNote = requiresHrApproval ? "[Hệ thống: Nghỉ dài hạn - Cần duyệt 2 cấp]" : "[Hệ thống: Nghỉ ngắn hạn - Chỉ cần Manager duyệt]"
            };
            
            return await _leaveRequestRepo.AddAsync(request);
        }

        public async Task<List<LeaveRequestHistoryDto>> GetMyLeaveRequestsAsync(int employeeId)
        {
            var requests = await _leaveRequestRepo.GetByEmployeeIdAsync(employeeId);
            return requests.Select(x => new LeaveRequestHistoryDto
            {
                Id = x.Id,
                LeaveTypeName = x.LeaveType?.Name ?? "Không xác định",
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Reason = x.Reason,
                Status = (int)x.Status,
                CreatedAt = x.CreatedAt
            }).ToList();
        }

        public async Task<List<LeaveRequestHistoryDto>> GetPendingLeaveRequestsAsync(string role)
        {
            var requests = await _leaveRequestRepo.GetPendingRequestsAsync();

            if (role == "Manager")
                requests = requests.Where(x => x.Status == ExplanationStatus.PendingManager).ToList();
            else if (role == "HR")
                requests = requests.Where(x => x.Status == ExplanationStatus.PendingHR).ToList();

            return requests.Select(x => new LeaveRequestHistoryDto
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeName = x.Employee?.FullName ?? "Nhân viên vô danh",
                AvatarUrl = x.Employee?.AvatarURL,
                ManagerNote = x.ManagerNote,
                LeaveTypeName = x.LeaveType?.Name ?? "",
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Reason = x.Reason,
                Status = (int)x.Status,
                CreatedAt = x.CreatedAt
            }).ToList();
        }

        public async Task ReviewLeaveRequestAsync(int id, string role, int reviewerId, ReviewLeaveRequestDto dto)
        {
            var request = await _leaveRequestRepo.GetByIdAsync(id);
            if (request == null) throw new KeyNotFoundException("Không tìm thấy đơn nghỉ phép.");

            if (!dto.IsApproved && string.IsNullOrWhiteSpace(dto.Note))
                throw new ArgumentException("Bắt buộc phải nhập lý do khi từ chối.");

            double actualLeaveDays = await CalculateActualLeaveDaysAsync(request.StartDate, request.EndDate);

            if (role == "Manager" && request.Status == ExplanationStatus.PendingManager)
            {
                if (request.ManagerId != reviewerId)
                    throw new UnauthorizedAccessException("Bạn không phải là Quản lý trực tiếp của nhân viên này.");

                request.ManagerActionDate = DateTime.Now;
                request.ManagerNote = dto.Note;

                if (!dto.IsApproved)
                {
                    request.Status = ExplanationStatus.Rejected;
                }
                else
                {
                    // Nếu nghỉ thực tế >= 3 ngày -> Đẩy lên HR duyệt tiếp
                    // Nếu nghỉ thực tế < 3 ngày -> Chốt luôn (Approved)
                    request.Status = actualLeaveDays >= 3 ? ExplanationStatus.PendingHR : ExplanationStatus.Approved;
                }
            }

            else if (role == "HR" && request.Status == ExplanationStatus.PendingHR)
            {
                request.HRAdminId = reviewerId;
                request.HRActionDate = DateTime.Now;
                request.HRNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.Approved : ExplanationStatus.Rejected;
            }
            else
            {
                throw new InvalidOperationException("Bạn không có quyền duyệt đơn này ở trạng thái hiện tại.");
            }

            if (dto.IsApproved && request.Status == ExplanationStatus.Approved)
            {
                // Trừ đi số ngày THỰC TẾ (actualLeaveDays)
                await _leaveBalanceService.CheckAndDeductLeaveAsync(request.EmployeeId, request.LeaveTypeId, request.StartDate.Year, actualLeaveDays);

                var affectedLogs = await _attendanceRepo.GetLogsByDateRangeAsync(request.EmployeeId, request.StartDate, request.EndDate);

                foreach (var log in affectedLogs)
                {
                    if (log.Status == AttendanceStatus.Absent || log.Status == AttendanceStatus.MissingCheckOut)
                    {
                        log.Status = AttendanceStatus.OnLeave;
                        log.Note = (log.Note + " | [System: Đã tự động cập nhật do đơn phép được duyệt]").Trim();
                        log.WorkingHours = 8;
                        log.LateMinutes = 0;
                        log.EarlyLeaveMinutes = 0;

                        await _attendanceRepo.UpdateAsync(log);
                    }
                }
            }

            await _leaveRequestRepo.UpdateAsync(request);
        }
        private async Task<double> CalculateActualLeaveDaysAsync(DateTime startDate, DateTime endDate)
        {
            double actualDays = 0;
            var holidays = await _holidayRepo.GetHolidaysInRangeAsync(startDate, endDate);

            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            var defaultShift = activeShifts?.FirstOrDefault();

            var workDaysList = string.IsNullOrEmpty(defaultShift?.WorkDays)
                ? new List<DayOfWeek> { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }
                : defaultShift.WorkDays.Split(',').Select(d => (DayOfWeek)int.Parse(d)).ToList();

            for (DateTime date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                if (!workDaysList.Contains(date.DayOfWeek))
                    continue;

                // Bỏ qua ngày Lễ
                bool isHoliday = holidays.Any(h => date >= h.StartDate.Date && date <= h.EndDate.Date);
                if (isHoliday)
                    continue;

                actualDays++;
            }
            return actualDays;
        }
    }
}