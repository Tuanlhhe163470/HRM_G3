using HRM_Domain.Entities;
using HRM_Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using HRM_Infrastructure.Data;
using HRM_Domain.Enums;

namespace HRM_Infrastructure.Repositories
{
    public class LeaveTypeRepository : ILeaveTypeRepository
    {
        private readonly HRMDbContext _context;
        public LeaveTypeRepository(HRMDbContext context) => _context = context;

        public async Task<List<LeaveType>> GetAllAsync()
        {
            return await _context.LeaveTypes.ToListAsync();
        }
    }

    public class LeaveRequestRepository : ILeaveRequestRepository
    {
        private readonly HRMDbContext _context;
        public LeaveRequestRepository(HRMDbContext context) => _context = context;

        public async Task<LeaveRequest> AddAsync(LeaveRequest request)
        {
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();
            return request;
        }
        public async Task<List<LeaveRequest>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.LeaveRequests
                .Include(x => x.LeaveType)
                .Where(x => x.EmployeeId == employeeId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<LeaveRequest>> GetPendingRequestsAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .Include(x => x.LeaveType)
                .Where(x => x.Status == HRM_Domain.Enums.ExplanationStatus.PendingManager ||
                            x.Status == HRM_Domain.Enums.ExplanationStatus.PendingHR)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<LeaveRequest> GetByIdAsync(int id)
        {
            return await _context.LeaveRequests
                .FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task UpdateAsync(LeaveRequest request)
        {
            _context.LeaveRequests.Update(request);
            await _context.SaveChangesAsync();
        }
        public async Task<LeaveRequest?> GetApprovedLeaveOnDateAsync(int employeeId, DateTime targetDate)
        {
            return await _context.LeaveRequests
                .Include(x => x.LeaveType)
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId
                    && x.Status == ExplanationStatus.Approved 
                    && targetDate.Date >= x.StartDate.Date
                    && targetDate.Date <= x.EndDate.Date);
        }
    }
}