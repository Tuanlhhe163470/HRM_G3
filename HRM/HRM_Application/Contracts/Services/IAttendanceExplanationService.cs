using HRM_Application.DTOs.TimeAttendance;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IAttendanceExplanationService
    {
        Task<AttendanceExplanationResponse> SubmitExplanationAsync(int employeeId, SubmitExplanationRequest request);

        Task<List<AttendanceExplanationResponse>> GetMyExplanationsAsync(int employeeId);

        Task<AttendanceExplanationResponse> GetByIdAsync(int explanationId);
        Task<AttendanceExplanationResponse> ReviewExplanationAsync(int explanationId, int reviewerId, string role, ReviewExplanationRequest request);
        Task<List<AttendanceExplanationResponse>> GetPendingExplanationsAsync(int reviewerId, string role);
    }
}