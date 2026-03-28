using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.PayRoll
{
    public class SalaryAdvanceService : ISalaryAdvanceService
    {
        private readonly ISalaryAdvanceRepository _repo;
        private readonly IEmployeeSalaryConfigRepository _configRepo;
        private readonly IMapper _mapper;

        public SalaryAdvanceService(ISalaryAdvanceRepository repo, IEmployeeSalaryConfigRepository configRepo, IMapper mapper)
        {
            _repo = repo;
            _configRepo = configRepo;
            _mapper = mapper;
        }

        public async Task<bool> RequestAdvanceAsync(int employeeId, CreateSalaryAdvanceDTO dto)
        {
            // Logic nghiệp vụ: Số tiền ứng phải lớn hơn 0
            if (dto.Amount <= 0) throw new InvalidOperationException("Số tiền ứng phải lớn hơn 0.");

            // Lấy thông tin lương cơ bản của nhân viên
            var configs = await _configRepo.GetByEmployeeIdAsync(employeeId);
            var baseSalary = configs
                .Where(c => c.SalaryComponent != null && c.SalaryComponent.ComponentName == "Base Salary")
                .Sum(c => c.Amount);

            // Kiểm tra ràng buộc hệ thống: chặn yêu cầu tạm ứng vượt quá 50% lương cơ bản
            if (baseSalary > 0 && dto.Amount > baseSalary * 0.5m)
            {
                throw new InvalidOperationException($"Số tiền tạm ứng ({dto.Amount:N0} VNĐ) không được vượt quá 50% lương cơ bản ({baseSalary:N0} VNĐ).");
            }
            else if (baseSalary == 0)
            {
                // Nếu nhân viên chưa có cấu hình lương cơ bản thì có thể chặn luôn
                throw new InvalidOperationException("Bạn chưa được thiết lập Lương cơ bản, không thể ứng lương.");
            }

            var advanceRequest = new SalaryAdvance
            {
                EmployeeID = employeeId,
                Amount = dto.Amount,
                Reason = dto.Reason,
                RequestDate = DateTime.Now,
                Status = "PENDING" // Đơn mới luôn ở trạng thái chờ duyệt
            };

            await _repo.CreateAdvanceRequestAsync(advanceRequest);
            return true;
        }

        public async Task<IEnumerable<SalaryAdvanceDTO>> GetMyAdvanceHistoryAsync(int employeeId)
        {
            var history = await _repo.GetByEmployeeIdAsync(employeeId);

            // Nhớ thêm CreateMap<SalaryAdvance, SalaryAdvanceDTO>(); vào file Profile của AutoMapper nhé!
            return _mapper.Map<IEnumerable<SalaryAdvanceDTO>>(history);
        }

        public async Task<IEnumerable<ManagerAdvanceDTO>> GetPendingRequestsAsync(int userId, string userRole)
        {
            var pendingList = await _repo.GetPendingAdvancesAsync(userId, userRole);

            return pendingList.Select(sa => new ManagerAdvanceDTO
            {
                AdvanceID = sa.AdvanceID,
                EmployeeName = sa.Employee?.FullName ?? "Unknown",
                Amount = sa.Amount,
                Reason = sa.Reason,
                RequestDate = sa.RequestDate,
                Status = sa.Status,
                ManagerNote = sa.ManagerNote,
                ApprovalDate = sa.ApprovalDate
            });
        }

        public async Task<IEnumerable<ManagerAdvanceDTO>> GetAllAdvancesAsync(int userId, string userRole)
        {
            var allList = await _repo.GetAllAdvancesAsync(userId, userRole);

            return allList.Select(sa => new ManagerAdvanceDTO
            {
                AdvanceID = sa.AdvanceID,
                EmployeeName = sa.Employee?.FullName ?? "Unknown",
                Amount = sa.Amount,
                Reason = sa.Reason,
                RequestDate = sa.RequestDate,
                Status = sa.Status,
                ManagerNote = sa.ManagerNote,
                ApprovalDate = sa.ApprovalDate
            });
        }

        public async Task<bool> ProcessAdvanceRequestAsync(int advanceId, ProcessAdvanceRequestDTO request, int managerId)
        {
            var advance = await _repo.GetAdvanceByIdAsync(advanceId);

            // Nếu không tìm thấy đơn hoặc đơn đã được duyệt/từ chối rồi thì bỏ qua
            if (advance == null || advance.Status != "PENDING") return false;

            // Cập nhật trạng thái
            advance.Status = request.IsApproved ? "APPROVED" : "REJECTED";
            advance.ManagerNote = request.ManagerNote;
            advance.ApprovedBy = managerId;
            advance.ApprovalDate = DateTime.Now;

            await _repo.UpdateAdvanceAsync(advance);
            return true;
        }
    }
}
