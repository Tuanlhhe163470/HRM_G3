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

        Task<bool> HasAttendanceAsync(int employeeId, DateTime date);

        Task<List<AttendanceLog>> GetMissingCheckOutsAsync(int employeeId, DateTime fromDate, DateTime toDate);

        Task AddRangeAsync(List<AttendanceLog> logs);

        Task<AttendanceLog?> GetActiveLogAsync(int employeeId);

        Task<AttendanceLog?> GetLogByShiftAndDateAsync(int employeeId, int shiftId, DateTime workDate);
        Task<List<AttendanceLog>> GetAllLogsByMonthAsync(int month, int year);
        Task<AttendanceLog?> GetByIdAsync(int attendanceLogId);
    }
}