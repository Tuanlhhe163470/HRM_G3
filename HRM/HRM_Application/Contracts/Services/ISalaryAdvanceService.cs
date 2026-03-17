using HRM_Application.DTOs.PayRoll;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface ISalaryAdvanceService
    {
        // UC: Nhân viên tạo đơn ứng lương
        Task<bool> RequestAdvanceAsync(int employeeId, CreateSalaryAdvanceDTO dto);

        // UC: Nhân viên xem lịch sử ứng lương của mình
        Task<IEnumerable<SalaryAdvanceDTO>> GetMyAdvanceHistoryAsync(int employeeId);

        Task<IEnumerable<ManagerAdvanceDTO>> GetPendingRequestsAsync(int userId, string userRole);
        Task<IEnumerable<ManagerAdvanceDTO>> GetAllAdvancesAsync(int userId, string userRole); // Manager xem toàn bộ lịch sử  
        Task<bool> ProcessAdvanceRequestAsync(int advanceId, ProcessAdvanceRequestDTO request, int managerId);
    }
}
