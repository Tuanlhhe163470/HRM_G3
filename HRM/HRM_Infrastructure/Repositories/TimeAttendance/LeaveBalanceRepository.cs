using HRM_Domain.Entities;
using HRM_Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using HRM_Infrastructure.Data;
using HRM_Application.Commons.Pagination;

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

        public async Task<PagedResponse<Employee>> GetAllAsync(PaginationFilter filter, int year, int leaveTypeId)
        {
            var query = _context.Employees
                .Include(e => e.LeaveBalances.Where(lb => lb.Year == year && lb.LeaveTypeId == leaveTypeId))
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Where(e => e.Status == "Active" || e.Status == "Working")
                .AsQueryable();

            var totalRecords = await query.CountAsync();

            var data = await query
                .OrderBy(e => e.EmployeeID) // Nên có OrderBy để phân trang chuẩn
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<Employee>(data, filter.PageNumber, filter.PageSize, totalRecords);
        }

        public async Task<List<LeaveBalance>> GetBalancesByYearAsync(int year, int leaveTypeId)
        {
            return await _context.LeaveBalances
                .Where(x => x.Year == year && x.LeaveTypeId == leaveTypeId)
                .ToListAsync();
        }

        public async Task<LeaveBalance?> GetByIdAsync(int id)
        {
            return await _context.LeaveBalances.FindAsync(id);
        }

        public async Task<LeaveBalance?> GetByEmployeeAndYearAsync(int employeeId, int leaveTypeId, int year)
        {
            return await _context.LeaveBalances
                .FirstOrDefaultAsync(l => l.EmployeeId == employeeId && l.LeaveTypeId == leaveTypeId && l.Year == year);
        }

        public async Task<bool> HasGeneratedForYearAsync(int year, int leaveTypeId)
        {
            return await _context.LeaveBalances.AnyAsync(l => l.Year == year && l.LeaveTypeId == leaveTypeId);
        }

        public async Task AddRangeAsync(IEnumerable<LeaveBalance> leaveBalances)
        {
            await _context.LeaveBalances.AddRangeAsync(leaveBalances);
            await _context.SaveChangesAsync();
        }
    }
}