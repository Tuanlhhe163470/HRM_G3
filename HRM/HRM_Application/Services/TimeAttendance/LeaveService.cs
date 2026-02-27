using HRM_Application.Contracts.Repositories;
using HRM_Application.DTOs.Leave;
using HRM_Application.Interfaces.Repositories;
using HRM_Application.Interfaces.Services;
using HRM_Domain.Entities;
using HRM_Domain.Enums;

namespace HRM_Application.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly ILeaveBalanceRepository _leaveBalanceRepo;
        private readonly ILeaveTypeRepository _leaveTypeRepo;
        private readonly ILeaveRequestRepository _leaveRequestRepo;
        private readonly IAttendanceRepository _attendanceRepo;

        public LeaveService(ILeaveBalanceRepository leaveBalanceRepo, ILeaveTypeRepository leaveTypeRepo, ILeaveRequestRepository leaveRequestRepo, IAttendanceRepository attendanceRepo)
        {
            _leaveBalanceRepo = leaveBalanceRepo;
            _leaveTypeRepo = leaveTypeRepo;
            _leaveRequestRepo = leaveRequestRepo;
            _attendanceRepo = attendanceRepo;
        }

        public async Task<List<LeaveBalanceDto>> GetMyBalancesAsync(int employeeId, int year)
        {
            var balances = await _leaveBalanceRepo.GetBalancesByEmployeeAsync(employeeId, year);

            var result = balances.Select(x => new LeaveBalanceDto
            {
                LeaveTypeId = x.LeaveTypeId,
                LeaveTypeName = x.LeaveType?.Name ?? "Không xác định",
                TotalDays = x.TotalDays,
                UsedDays = x.UsedDays
            }).ToList();

            return result;
        }

        public async Task<List<LeaveType>> GetLeaveTypesAsync()
        {
            return await _leaveTypeRepo.GetAllAsync();
        }

        public async Task<LeaveRequest> SubmitLeaveRequestAsync(int employeeId, CreateLeaveRequestDto dto)
        {
            if (dto.StartDate.Date > dto.EndDate.Date)
            {
                throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            }
            var duration = dto.EndDate - dto.StartDate;
            if (duration.TotalHours < 1)
            {
                throw new ArgumentException("Thời gian xin nghỉ tối thiểu phải là 1 tiếng.");
            }

            if (dto.StartDate.Date < DateTime.Now.Date.AddDays(-3))
            {
                throw new ArgumentException("Bạn chỉ được phép làm đơn xin nghỉ bù tối đa cho 3 ngày trước đó.");
            }

            // Khởi tạo Entity để lưu xuống DB
            var request = new LeaveRequest
            {
                EmployeeId = employeeId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = HRM_Domain.Enums.ExplanationStatus.PendingManager, // Mặc định chuyển cho Manager duyệt
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
                requests = requests.Where(x => x.Status == HRM_Domain.Enums.ExplanationStatus.PendingManager).ToList();
            else if (role == "HR")
                requests = requests.Where(x => x.Status == HRM_Domain.Enums.ExplanationStatus.PendingHR).ToList();

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

            if (role == "Manager" && request.Status == ExplanationStatus.PendingManager)
            {
                request.ManagerId = reviewerId;
                request.ManagerActionDate = DateTime.Now;
                request.ManagerNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.PendingHR : ExplanationStatus.Rejected;
            }
            else if (role == "HR" && request.Status == ExplanationStatus.PendingHR)
            {
                request.HRAdminId = reviewerId;
                request.HRActionDate = DateTime.Now;
                request.HRNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.Approved : ExplanationStatus.Rejected;

                // Trừ quỹ phép khi HR duyệt
                if (dto.IsApproved)
                {
                    var balances = await _leaveBalanceRepo.GetBalancesByEmployeeAsync(request.EmployeeId, request.StartDate.Year);
                    var balance = balances.FirstOrDefault(b => b.LeaveTypeId == request.LeaveTypeId);

                    if (balance != null)
                    {
                        double daysTaken = (request.EndDate.Date - request.StartDate.Date).TotalDays + 1;
                        balance.UsedDays += daysTaken;

                        await _leaveBalanceRepo.UpdateAsync(balance);
                    }
                    //chuyển trạng thái chấm công
                    var affectedLogs = await _attendanceRepo.GetLogsByDateRangeAsync(request.EmployeeId, request.StartDate, request.EndDate);

                    foreach (var log in affectedLogs)
                    {
                        // Chỉ "cứu" những ngày bị hệ thống phạt (Vắng mặt = 4, Quên CheckOut = 6)
                        if (log.Status == HRM_Domain.Enums.AttendanceStatus.Absent ||
                            log.Status == HRM_Domain.Enums.AttendanceStatus.MissingCheckOut)
                        {
                            log.Status = HRM_Domain.Enums.AttendanceStatus.OnLeave; // 9: Nghỉ có phép
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