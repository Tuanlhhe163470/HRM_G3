using HRM_Domain.Entities;
using HRM_Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using HRM_Infrastructure.Data;

namespace HRM_Infrastructure.Repositories
{
    public class LeaveBalanceRepository : ILeaveBalanceRepository
    {
        private readonly HRMDbContext _context;

        public LeaveBalanceRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeaveBalance>> GetBalancesByEmployeeAsync(int employeeId, int year)
        {
            return await _context.LeaveBalances
                .Include(x => x.LeaveType) //lấy tên phép
                .Where(x => x.EmployeeId == employeeId && x.Year == year)
                .ToListAsync();
        }
        public async Task UpdateAsync(LeaveBalance balance)
        {
            _context.LeaveBalances.Update(balance);
            await _context.SaveChangesAsync();
        }
    }
}