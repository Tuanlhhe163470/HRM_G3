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

        public LeaveService(
            ILeaveBalanceService leaveBalanceService,
            ILeaveBalanceRepository leaveBalanceRepo,
            ILeaveTypeRepository leaveTypeRepo,
            ILeaveRequestRepository leaveRequestRepo,
            IAttendanceRepository attendanceRepo,
            IEmployeeRepository employeeRepo)
        {
            _leaveBalanceService = leaveBalanceService;
            _leaveBalanceRepo = leaveBalanceRepo;
            _leaveTypeRepo = leaveTypeRepo;
            _leaveRequestRepo = leaveRequestRepo;
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
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

            var duration = dto.EndDate - dto.StartDate;
            if (duration.TotalHours < 1)
                throw new ArgumentException("Thời gian xin nghỉ tối thiểu phải là 1 tiếng.");

            if (dto.StartDate.Date < DateTime.Now.Date.AddDays(-3))
                throw new ArgumentException("Bạn chỉ được phép làm đơn xin nghỉ bù tối đa cho 3 ngày trước đó.");

            double requestedDays = (dto.EndDate.Date - dto.StartDate.Date).TotalDays + 1;

            var balance = await _leaveBalanceService.GetByEmployeeAndYearAsync(employeeId, dto.LeaveTypeId, dto.StartDate.Year);

            if (balance == null)
                throw new InvalidOperationException("Bạn chưa được cấp quỹ phép cho năm nay.");

            if (balance.RemainingDays < requestedDays)
                throw new InvalidOperationException($"Không đủ ngày phép. Bạn còn {balance.RemainingDays} ngày, xin nghỉ {requestedDays} ngày.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(employeeId);
            if (employee == null) throw new KeyNotFoundException("Không tìm thấy thông tin nhân viên.");

            if (employee.ManagerID == null)
            {
                throw new InvalidOperationException("Bạn chưa được gán Sếp quản lý trực tiếp. Vui lòng liên hệ HR.");
            }

            var request = new LeaveRequest
            {
                EmployeeId = employeeId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                ManagerId = employee.ManagerID.Value,
                Status = ExplanationStatus.PendingManager,
                CreatedAt = DateTime.Now
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

            // QUY TRÌNH DUYỆT CẤP 1: MANAGER DUYỆT
            if (role == "Manager" && request.Status == ExplanationStatus.PendingManager)
            {
                if (request.ManagerId != reviewerId)
                {
                    throw new UnauthorizedAccessException("Bạn không phải là Quản lý trực tiếp của nhân viên này.");
                }

                request.ManagerActionDate = DateTime.Now;
                request.ManagerNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.PendingHR : ExplanationStatus.Rejected;
            }
            // QUY TRÌNH DUYỆT CẤP 2: HR DUYỆT CHỐT ĐƠN
            else if (role == "HR" && request.Status == ExplanationStatus.PendingHR)
            {
                request.HRAdminId = reviewerId;
                request.HRActionDate = DateTime.Now;
                request.HRNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.Approved : ExplanationStatus.Rejected;

                if (dto.IsApproved)
                {
                    double daysTaken = (request.EndDate.Date - request.StartDate.Date).TotalDays + 1;

                    await _leaveBalanceService.CheckAndDeductLeaveAsync(request.EmployeeId, request.LeaveTypeId, request.StartDate.Year, daysTaken);

                    var affectedLogs = await _attendanceRepo.GetLogsByDateRangeAsync(request.EmployeeId, request.StartDate, request.EndDate);

                    foreach (var log in affectedLogs)
                    {
                        if (log.Status == AttendanceStatus.Absent || log.Status == AttendanceStatus.MissingCheckOut)
                        {
                            log.Status = AttendanceStatus.OnLeave; // Nghỉ có phép
                            log.Note = "[System: Đã duyệt phép muộn]";
                            log.WorkingHours = 8;
                            log.LateMinutes = 0;
                            log.EarlyLeaveMinutes = 0;

                            await _attendanceRepo.UpdateAsync(log);
                        }
                    }
                }
            }
            else
            {
                throw new InvalidOperationException("Bạn không có quyền duyệt đơn này ở trạng thái hiện tại.");
            }

            await _leaveRequestRepo.UpdateAsync(request);
        }
    }
}