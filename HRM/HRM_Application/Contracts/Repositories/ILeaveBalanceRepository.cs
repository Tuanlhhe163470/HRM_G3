using HRM_Domain.Entities;

namespace HRM_Application.Interfaces.Repositories
{
    public interface ILeaveBalanceRepository
    {
        // Hàm lấy quỹ phép theo Nhân viên và Năm
        Task<List<LeaveBalance>> GetBalancesByEmployeeAsync(int employeeId, int year);
        Task UpdateAsync(LeaveBalance balance);
    }
}