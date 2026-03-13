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
        Task<IEnumerable<SalaryAdvance>> GetPendingAdvancesAsync();
        Task<IEnumerable<SalaryAdvance>> GetAllAdvancesAsync(); // Lấy toàn bộ đơn (cho Manager xem lịch sử)
        Task<SalaryAdvance?> GetAdvanceByIdAsync(int id);
        Task UpdateAdvanceAsync(SalaryAdvance advance);
    }
}
