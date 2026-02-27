using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.TimeAttendance
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly HRMDbContext _context;
        public AttendanceRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AttendanceLog log)
        {
            await _context.AttendanceLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(List<AttendanceLog> logs)
        {
            await _context.AttendanceLogs.AddRangeAsync(logs);
            await _context.SaveChangesAsync();
        }

        public Task<AttendanceLog?> GetActiveLogAsync(int employeeId)
        {
            return _context.AttendanceLogs
                .Include(x => x.ShiftConfig)
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId
                && x.CheckInTime != null
                && x.CheckOutTime == null);
        }

        public async Task<List<AttendanceLog>> GetAllLogsByMonthAsync(int month, int year)
        {
            return await _context.AttendanceLogs
                .Where(x => x.WorkDate.Month == month && x.WorkDate.Year == year)
                .ToListAsync();
        }

        public async Task<AttendanceLog?> GetByDateAsync(int employeeId, DateTime date)
        {
            return await _context.AttendanceLogs
                .Include(x => x.ShiftConfig)
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.WorkDate.Date == date.Date);
        }

        public async Task<AttendanceLog?> GetByIdAsync(int attendanceLogId)
        {
            return await _context.AttendanceLogs
                .Include(x => x.ShiftConfig)
                .FirstOrDefaultAsync(x => x.Id == attendanceLogId);
        }

        public async Task<List<AttendanceLog>> GetByMonthAsync(int employeeId, int month, int year)
        {
            return await _context.AttendanceLogs
                .Include(x => x.ShiftConfig)
                .Where(x => x.EmployeeId == employeeId && x.WorkDate.Month == month && x.WorkDate.Year == year)
                .OrderByDescending(x => x.WorkDate)
                .ToListAsync();
        }

        public Task<AttendanceLog?> GetLogByShiftAndDateAsync(int employeeId, int shiftId, DateTime workDate)
        {
            return _context.AttendanceLogs
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId
                && x.ShiftId == shiftId
                && x.WorkDate.Date == workDate.Date);
        }

        public async Task<List<AttendanceLog>> GetMissingCheckOutsAsync(int employeeId, DateTime fromDate, DateTime toDate)
        {
            return await _context.AttendanceLogs
                .Where(x => x.EmployeeId == employeeId
                            && x.WorkDate >= fromDate && x.WorkDate <= toDate
                            && x.CheckInTime != null
                            && x.CheckOutTime == null
                            && x.Status != AttendanceStatus.MissingCheckOut)
                .ToListAsync();
        }

        public async Task<bool> HasAttendanceAsync(int employeeId, DateTime date)
        {
            return await _context.AttendanceLogs.AnyAsync(x => x.EmployeeId == employeeId && x.WorkDate.Date == date.Date);
        }

        public async Task UpdateAsync(AttendanceLog log)
        {
            _context.AttendanceLogs.Update(log);
            await _context.SaveChangesAsync();
        }
        public async Task<List<AttendanceLog>> GetLogsByDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate)
        {
            return await _context.AttendanceLogs
                .Where(x => x.EmployeeId == employeeId
                         && x.WorkDate.Date >= startDate.Date
                         && x.WorkDate.Date <= endDate.Date)
                .ToListAsync();
        }
    }
}