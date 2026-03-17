using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IShiftRepository
    {
        Task<PagedResponse<ShiftConfig>> GetAllShiftsAsync(PaginationFilter filter);
        Task<ShiftConfig?> GetShiftByIdAsync(int id);
        Task AddShiftAsync(ShiftConfig shift);
        Task UpdateShiftAsync(ShiftConfig shift);
        Task DeleteShiftAsync(int id);

        // Lấy ca làm việc mặc định đang hoạt động
        Task<List<ShiftConfig>> GetActiveShiftAsync();
        Task<bool> CheckShiftNameExistsAsync(string shiftName);
    }
}
