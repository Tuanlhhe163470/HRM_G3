using HRM_Domain.Entities;

namespace HRM_Application.Interfaces.Repositories
{
    public interface ILeaveTypeRepository
    {
        Task<List<LeaveType>> GetAllAsync();
    }

    public interface ILeaveRequestRepository
    {
        Task<LeaveRequest> AddAsync(LeaveRequest request);
        Task<List<LeaveRequest>> GetByEmployeeIdAsync(int employeeId);
        Task<List<LeaveRequest>> GetPendingRequestsAsync();
        Task<LeaveRequest> GetByIdAsync(int id);
        Task UpdateAsync(LeaveRequest request);
        Task<LeaveRequest?> GetApprovedLeaveOnDateAsync(int employeeId, DateTime targetDate);
    }
}