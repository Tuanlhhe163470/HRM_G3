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

        public async Task<IEnumerable<SalaryAdvance>> GetPendingAdvancesAsync()
        {
            return await _context.SalaryAdvances
                .Include(sa => sa.Employee) // Lấy luôn tên nhân viên
                .Where(sa => sa.Status == "PENDING")
                .OrderBy(sa => sa.RequestDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<SalaryAdvance>> GetAllAdvancesAsync()
        {
            return await _context.SalaryAdvances
                .Include(sa => sa.Employee) // Lấy luôn tên nhân viên
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
    }
}
