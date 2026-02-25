using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IMonthlyTimesheetRepository
    {
        // Tìm bảng công của 1 nhân viên trong 1 tháng cụ thể
        Task<MonthlyTimesheet?> GetByEmployeeAndMonthAsync(int employeeId, int month, int year);

        // Thêm mới một loạt (Bulk Insert)
        Task AddRangeAsync(IEnumerable<MonthlyTimesheet> timesheets);

        // Cập nhật một loạt (Bulk Update)
        Task UpdateRangeAsync(IEnumerable<MonthlyTimesheet> timesheets);

        Task<List<MonthlyTimesheet>> GetAllByMonthAsync(int month, int year);
    }
}
