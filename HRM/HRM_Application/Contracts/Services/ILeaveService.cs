using HRM_Application.DTOs.Leave;
using HRM_Domain.Entities;

namespace HRM_Application.Interfaces.Services
{
    public interface ILeaveService
    {
        Task<List<LeaveBalanceDto>> GetMyBalancesAsync(int employeeId, int year);

        Task<List<LeaveType>> GetLeaveTypesAsync();
        Task<LeaveRequest> SubmitLeaveRequestAsync(int employeeId, CreateLeaveRequestDto dto);
        Task<List<LeaveRequestHistoryDto>> GetMyLeaveRequestsAsync(int employeeId);
        Task<List<LeaveRequestHistoryDto>> GetPendingLeaveRequestsAsync(string role);
        Task ReviewLeaveRequestAsync(int id, string role, int reviewerId, ReviewLeaveRequestDto dto);
    }
}