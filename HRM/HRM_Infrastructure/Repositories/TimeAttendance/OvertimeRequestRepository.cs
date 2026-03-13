using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.TimeAttendance
{
    public class OvertimeRequestRepository : IOvertimeRequestRepository
    {
        private readonly HRMDbContext _context;

        public OvertimeRequestRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<OvertimeRequest> AddAsync(OvertimeRequest request)
        {
            await _context.OvertimeRequests.AddAsync(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task UpdateAsync(OvertimeRequest request)
        {
            _context.OvertimeRequests.Update(request);
            await _context.SaveChangesAsync();
        }

        public async Task<OvertimeRequest?> GetByIdAsync(int id)
        {
            return await _context.OvertimeRequests.FindAsync(id);
        }

        public async Task<List<OvertimeRequest>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.OvertimeRequests
                .Include(o => o.Employee)
                .Where(o => o.EmployeeId == employeeId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<OvertimeRequest>> GetPendingRequestsAsync()
        {
            // Lấy các đơn đang chờ duyệt (PendingManager hoặc PendingHR)
            return await _context.OvertimeRequests
                .Include(o => o.Employee)
                .Where(o => o.Status == HRM_Domain.Enums.ExplanationStatus.PendingManager
                         || o.Status == HRM_Domain.Enums.ExplanationStatus.PendingHR)
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<OvertimeRequest>> GetApprovedOTByMonthAsync(int month, int year)
        {
            return await _context.OvertimeRequests
                .Where(o => o.Date.Month == month
                         && o.Date.Year == year
                         && o.Status == HRM_Domain.Enums.ExplanationStatus.Approved)
                .ToListAsync();
        }

        public async Task<IEnumerable<OvertimeRequest>> GetByEmployeeAndMonthAsync(int employeeId, int month, int year)
        {
            return await _context.OvertimeRequests
                .Where(o => o.EmployeeId == employeeId
                         && o.Date.Month == month
                         && o.Date.Year == year
                         && o.Status == HRM_Domain.Enums.ExplanationStatus.Approved)
                .ToListAsync();
        }
    }
}