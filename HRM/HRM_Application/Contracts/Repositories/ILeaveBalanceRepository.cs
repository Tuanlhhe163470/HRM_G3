using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities;

namespace HRM_Application.Interfaces.Repositories
{
    public interface ILeaveBalanceRepository
    {
        // Hàm lấy quỹ phép theo Nhân viên và Năm
        Task<List<LeaveBalance>> GetBalancesByEmployeeAsync(int employeeId, int year);
        Task UpdateAsync(LeaveBalance balance);

        Task<PagedResponse<LeaveBalance>> GetAllAsync(PaginationFilter filter);
        Task<LeaveBalance?> GetByIdAsync(int id);
        Task<LeaveBalance?> GetByEmployeeAndYearAsync(int employeeId, int leaveTypeId, int year);

        // Kiểm tra xem năm nay đã tạo quỹ phép chưa (Tránh HR bấm đúp 2 lần)
        Task<bool> HasGeneratedForYearAsync(int year, int leaveTypeId);

        Task AddRangeAsync(IEnumerable<LeaveBalance> leaveBalances);
    }
}