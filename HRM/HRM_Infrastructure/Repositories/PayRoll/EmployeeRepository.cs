using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.PayRoll
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly HRMDbContext _context;

        public EmployeeRepository(HRMDbContext context)
        {
            _context = context;
        }

        // Hàm này cực kỳ quan trọng cho UC Calculate Monthly Payroll
        // Nó giúp Service lấy ra toàn bộ nhân viên để chạy vòng lặp tính lương
        public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees.ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees.FindAsync(id);
        }
    }
}