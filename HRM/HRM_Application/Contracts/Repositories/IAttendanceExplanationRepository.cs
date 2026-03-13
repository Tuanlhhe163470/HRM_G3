using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IAttendanceExplanationRepository
    {
        Task<AttendanceExplanation> AddAsync(AttendanceExplanation explanation);

        Task UpdateAsync(AttendanceExplanation explanation);

        // Lấy chi tiết 1 đơn theo ID
        Task<AttendanceExplanation?> GetByIdAsync(int id);

        // Lấy danh sách lịch sử đơn của 1 nhân viên (để hiển thị trên My Timesheet)
        Task<List<AttendanceExplanation>> GetByEmployeeIdAsync(int employeeId);

        // Kiểm tra xem ca làm việc này đã có đơn nào đang chờ duyệt chưa (Chặn spam)
        Task<bool> HasPendingExplanationAsync(int attendanceLogId);

        Task<List<AttendanceExplanation>> GetPendingExplanationsAsync(string role, int reviewerId);

        Task<AttendanceExplanation> GetExplanationWithDetailsAsync(int id);
    }
}