using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.PayRoll.Repositories
{
    public class PayrollRepository : IPayrollRepository
    {
        private readonly HRMDbContext _context;
        public PayrollRepository(HRMDbContext context) => _context = context;

        public async Task<bool> UpsertPayrollAsync(Payroll payroll)
        {
            var existing = await _context.Payrolls
                .FirstOrDefaultAsync(p => p.EmployeeID == payroll.EmployeeID && p.Month == payroll.Month && p.Year == payroll.Year);

            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(payroll);
            }
            else
            {
                await _context.Payrolls.AddAsync(payroll);
            }
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Payroll>> GetMonthlyPayrollAsync(int month, int year)
        {
            return await _context.Payrolls
                .Include(p => p.Employee)
                .Where(p => p.Month == month && p.Year == year)
                .ToListAsync();
        }
    }
}