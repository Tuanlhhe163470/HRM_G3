using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface ISalaryAdvanceRepository
    {
        Task CreateAdvanceRequestAsync(SalaryAdvance request);
        Task<IEnumerable<SalaryAdvance>> GetByEmployeeIdAsync(int employeeId);
        Task<IEnumerable<SalaryAdvance>> GetPendingAdvancesAsync(int userId, string userRole);
        Task<IEnumerable<SalaryAdvance>> GetAllAdvancesAsync(int userId, string userRole); // Lấy toàn bộ đơn (cho Manager xem lịch sử)
        Task<SalaryAdvance?> GetAdvanceByIdAsync(int id);
        Task<IEnumerable<SalaryAdvance>> GetApprovedAdvancesByMonthAsync(int month, int year);
        Task UpdateAdvanceAsync(SalaryAdvance advance);
    }
}
