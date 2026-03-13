using HRM_Application.DTOs.Overtime;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IOvertimeService
    {
        Task SubmitRequestAsync(int employeeId, CreateOvertimeRequestDto dto);
        Task<List<OvertimeRequestHistoryDto>> GetMyRequestsAsync(int employeeId);
        Task<List<OvertimeRequestHistoryDto>> GetPendingRequestsAsync(string role);
        Task ReviewRequestAsync(int id, string role, int reviewerId, ReviewOvertimeDto dto);
    }
}