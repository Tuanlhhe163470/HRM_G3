using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data; // Thay bằng namespace chứa DbContext của bạn
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.TimeAttendance
{
    public class MonthlyTimesheetRepository : IMonthlyTimesheetRepository
    {
        private readonly HRMDbContext _context;

        public MonthlyTimesheetRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyTimesheet?> GetByEmployeeAndMonthAsync(int employeeId, int month, int year)
        {
            return await _context.MonthlyTimesheets
                .FirstOrDefaultAsync(x => x.EmployeeID == employeeId && x.Month == month && x.Year == year);
        }

        public async Task AddRangeAsync(IEnumerable<MonthlyTimesheet> timesheets)
        {
            await _context.MonthlyTimesheets.AddRangeAsync(timesheets);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<MonthlyTimesheet> timesheets)
        {
            _context.MonthlyTimesheets.UpdateRange(timesheets);
            await _context.SaveChangesAsync();
        }

        public async Task<List<MonthlyTimesheet>> GetAllByMonthAsync(int month, int year)
        {
            return await _context.MonthlyTimesheets
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Department)
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Position) 
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
        }

        public async Task<bool> IsTimesheetLockedAsync(int month, int year)
        {
            return await _context.MonthlyTimesheets
                    .AnyAsync(t => t.Month == month && t.Year == year && t.Status == HRM_Domain.Enums.TimesheetStatus.Locked);
        }
    }
}