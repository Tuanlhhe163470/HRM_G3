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

        public async Task<MonthlyTimesheet?> GetTimesheetAsync(int employeeId, int month, int year)
        {
            return await _context.MonthlyTimesheets
                .FirstOrDefaultAsync(t => t.EmployeeID == employeeId && t.Month == month && t.Year == year);
        }

        public async Task UpsertPayrollAsync(MonthlyPayroll payroll)
        {
            var existing = await _context.MonthlyPayrolls
                .FirstOrDefaultAsync(p => p.EmployeeID == payroll.EmployeeID && p.Month == payroll.Month && p.Year == payroll.Year);

            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(payroll);
            }
            else
            {
                await _context.MonthlyPayrolls.AddAsync(payroll);
            }
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<MonthlyPayroll>> GetMonthlyPayrollAsync(int month, int year)
        {
            return await _context.MonthlyPayrolls
                .Include(p => p.Employee)
                .Where(p => p.Month == month && p.Year == year)
                .ToListAsync();
        }

        public async Task UpdateAdjustmentAsync(int payrollId, decimal amount, string reason)
        {
            var payroll = await _context.MonthlyPayrolls.FindAsync(payrollId);
            if (payroll != null)
            {
                payroll.AdjustmentAmount = amount;
                payroll.AdjustmentReason = reason;
                // Tính lại lương thực nhận cuối cùng
                payroll.FinalNetSalary = (payroll.SalaryPerDay * payroll.ActualWorkDays)
                                         + payroll.TotalAllowance - payroll.TotalDeduction + amount;
                await _context.SaveChangesAsync();
            }
        }

        public async Task ApproveStatusAsync(int payrollId, string status, int managerId)
        {
            var payroll = await _context.MonthlyPayrolls.FindAsync(payrollId);
            if (payroll != null)
            {
                payroll.Status = status;
                if (status == "Approved")
                {
                    payroll.ApprovedBy = managerId;
                    payroll.ApprovedDate = DateTime.Now;
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}