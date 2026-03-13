using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.Payroll
{
    public class EmployeeSalaryConfigRepository : IEmployeeSalaryConfigRepository
    {
        private readonly HRMDbContext _context;
        public EmployeeSalaryConfigRepository(HRMDbContext context) => _context = context;

        // Sửa tên hàm: Bỏ chữ "Configs"
        public async Task<IEnumerable<EmployeeSalaryConfig>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.EmployeeSalaryConfigs
                .Include(x => x.SalaryComponent) // Bắt buộc phải có dòng này để lấy ComponentName
                .Where(x => x.EmployeeID == employeeId && x.IsActive)
                .ToListAsync();
        }

        public async Task<EmployeeSalaryConfig?> GetConfigByEmployeeAndComponentAsync(int employeeId, int componentId)
        {
            return await _context.EmployeeSalaryConfigs
                .FirstOrDefaultAsync(x => x.EmployeeID == employeeId && x.ComponentID == componentId);
        }

        public async Task<EmployeeSalaryConfig?> GetByIdAsync(int id)
        {
            return await _context.EmployeeSalaryConfigs.FindAsync(id);
        }

        public async Task AddAsync(EmployeeSalaryConfig entity)
        {
            await _context.EmployeeSalaryConfigs.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(EmployeeSalaryConfig entity)
        {
            _context.EmployeeSalaryConfigs.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}