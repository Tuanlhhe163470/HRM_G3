using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.LeaveBalance.Requests;
using HRM_Application.DTOs.LeaveBalance.Responses;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface ILeaveBalanceService
    {
        Task<PagedResponse<LeaveBalanceResponse>> GetAllAsync(PaginationFilter filter, int year, int leaveTypeId);
        Task<LeaveBalanceResponse?> GetByEmployeeAndYearAsync(int employeeId, int leaveTypeId, int year);

        Task GenerateAnnualLeaveBalancesAsync(GenerateLeaveBalanceRequest request);

        Task AdjustLeaveBalanceAsync(int id, AdjustLeaveBalanceRequest request);

        Task CheckAndDeductLeaveAsync(int employeeId, int leaveTypeId, int year, double daysToDeduct);
    }
}