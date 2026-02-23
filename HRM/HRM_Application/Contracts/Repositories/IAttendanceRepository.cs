using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IAttendanceRepository
    {
        Task<AttendanceLog?> GetByDateAsync(int employeeId, DateTime date);

        Task<List<AttendanceLog>> GetByMonthAsync(int employeeId, int month, int year);

        Task AddAsync(AttendanceLog log);
        Task UpdateAsync(AttendanceLog log);

        // 1. Kiểm tra xem 1 nhân viên đã có log trong ngày chưa (để đánh Absent)
        Task<bool> HasAttendanceAsync(int employeeId, DateTime date);

        // 2. Lấy các log chưa checkout của 1 nhân viên trong khoảng thời gian
        Task<List<AttendanceLog>> GetMissingCheckOutsAsync(int employeeId, DateTime fromDate, DateTime toDate);

        // 3. Add nhiều log cùng lúc (để add Absent cho nhanh)
        Task AddRangeAsync(List<AttendanceLog> logs);
    }
}
