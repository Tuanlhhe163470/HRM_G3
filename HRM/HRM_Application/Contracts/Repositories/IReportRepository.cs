using System.Collections.Generic;
using System.Threading.Tasks;
using HRM_Domain.Entities;

namespace HRM_Application.Contracts.Repositories
{
    public interface IReportRepository
    {
        // Hàm chuyên dụng để lấy bảng lương đã duyệt phục vụ báo cáo
        Task<IEnumerable<MonthlyPayroll>> GetApprovedPayrollsForReportAsync(int month, int year);
    }
}