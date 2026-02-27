using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories
{
    public class AttendanceExplanationRepository : IAttendanceExplanationRepository
    {
        private readonly HRMDbContext _context;

        public AttendanceExplanationRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<AttendanceExplanation> AddAsync(AttendanceExplanation explanation)
        {
            await _context.AttendanceExplanations.AddAsync(explanation);
            await _context.SaveChangesAsync();
            return explanation;
        }

        public async Task UpdateAsync(AttendanceExplanation explanation)
        {
            _context.AttendanceExplanations.Update(explanation);
            await _context.SaveChangesAsync();
        }

        public async Task<AttendanceExplanation?> GetByIdAsync(int id)
        {
            return await _context.AttendanceExplanations
                .Include(x => x.AttendanceLog)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<AttendanceExplanation>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.AttendanceExplanations
                .Include(x => x.AttendanceLog)
                    .ThenInclude(al => al.ShiftConfig)
                .Where(x => x.EmployeeId == employeeId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> HasPendingExplanationAsync(int attendanceLogId)
        {
            return await _context.AttendanceExplanations.AnyAsync(x =>
                x.AttendanceLogId == attendanceLogId &&
                (x.Status == ExplanationStatus.PendingManager || x.Status == ExplanationStatus.PendingHR));
        }

        public async Task<List<AttendanceExplanation>> GetPendingExplanationsAsync(string role, int reviewerId)
        {
            var reviewerInfo = await _context.Employees
                .Where(e => e.EmployeeID == reviewerId)
                .Select(e => new { e.DepartmentID })
                .FirstOrDefaultAsync();

            if (reviewerInfo == null) return new List<AttendanceExplanation>();

            var query = _context.AttendanceExplanations
                .Include(x => x.AttendanceLog)
                    .ThenInclude(al => al.ShiftConfig)
                .Include(x => x.AttendanceLog)
                    .ThenInclude(al => al.Employee)
                .AsQueryable();

            if (role == "Manager")
            {
                query = query.Where(x => x.AttendanceLog.Employee.DepartmentID == reviewerInfo.DepartmentID
                                      && x.Status == ExplanationStatus.PendingManager);
            }
            else if (role == "HR")
            {
                query = query.Where(x => x.Status == ExplanationStatus.PendingHR);
            }
            else
            {
                return new List<AttendanceExplanation>();
            }

            return await query.OrderBy(x => x.CreatedAt).ToListAsync();
        }

        public async Task<AttendanceExplanation> GetExplanationWithDetailsAsync(int id)
        {
            return await _context.AttendanceExplanations
                .Include(x => x.AttendanceLog)
                    .ThenInclude(al => al.ShiftConfig)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}