using HRM_Domain.Entities.TimeAttendance;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IOvertimeRequestRepository
    {
        Task<OvertimeRequest> AddAsync(OvertimeRequest request);
        Task UpdateAsync(OvertimeRequest request);
        Task<OvertimeRequest?> GetByIdAsync(int id);
        Task<List<OvertimeRequest>> GetByEmployeeIdAsync(int employeeId);
        Task<List<OvertimeRequest>> GetPendingRequestsAsync();
        // Lấy toàn bộ đơn OT đã ĐƯỢC DUYỆT của toàn công ty trong tháng
        Task<List<OvertimeRequest>> GetApprovedOTByMonthAsync(int month, int year);
        Task<IEnumerable<OvertimeRequest>> GetByEmployeeAndMonthAsync(int employeeId, int month, int year);
    }
}