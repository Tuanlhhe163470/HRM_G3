using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.PayRoll
{
    public class SalaryAdvanceRepository : ISalaryAdvanceRepository
    {
        private readonly HRMDbContext _context;
        public SalaryAdvanceRepository(HRMDbContext context) => _context = context;

        public async Task CreateAdvanceRequestAsync(SalaryAdvance request)
        {
            await _context.SalaryAdvances.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<SalaryAdvance>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.SalaryAdvances
                .Where(sa => sa.EmployeeID == employeeId)
                .OrderByDescending(sa => sa.RequestDate) // Xếp đơn mới nhất lên đầu
                .ToListAsync();
        }

        public async Task<IEnumerable<SalaryAdvance>> GetPendingAdvancesAsync(int userId, string userRole)
        {
            IQueryable<SalaryAdvance> query = _context.SalaryAdvances
                .Include(sa => sa.Employee) // Lấy luôn tên nhân viên
                .Where(sa => sa.Status == "PENDING");

            if (userRole == "Manager")
            {
                var manager = await _context.Employees.FindAsync(userId);
                if (manager != null)
                {
                    query = query.Where(sa => sa.Employee.DepartmentID == manager.DepartmentID);
                }
            }

            return await query
                .OrderBy(sa => sa.RequestDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<SalaryAdvance>> GetAllAdvancesAsync(int userId, string userRole)
        {
            IQueryable<SalaryAdvance> query = _context.SalaryAdvances
                .Include(sa => sa.Employee); // Lấy luôn tên nhân viên

            if (userRole == "Manager")
            {
                var manager = await _context.Employees.FindAsync(userId);
                if (manager != null)
                {
                    query = query.Where(sa => sa.Employee.DepartmentID == manager.DepartmentID);
                }
            }

            return await query
                .OrderByDescending(sa => sa.RequestDate) // Mới nhất lên đầu
                .ToListAsync();
        }

        public async Task<SalaryAdvance?> GetAdvanceByIdAsync(int id)
        {
            return await _context.SalaryAdvances.FindAsync(id);
        }

        public async Task UpdateAdvanceAsync(SalaryAdvance advance)
        {
            _context.SalaryAdvances.Update(advance);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<SalaryAdvance>> GetApprovedAdvancesByMonthAsync(int month, int year)
        {
            return await _context.SalaryAdvances
                .Where(sa => sa.Status == "APPROVED" && sa.ApprovalDate.HasValue && sa.ApprovalDate.Value.Month == month && sa.ApprovalDate.Value.Year == year)
                .ToListAsync();
        }
    }
}
