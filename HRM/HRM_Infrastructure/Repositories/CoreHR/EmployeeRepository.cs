using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.Repositories.CoreHR
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly HRMDbContext _context;

        public EmployeeRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<Employee>> GetAllEmployeesAsync(PaginationFilter filter)
        {
            var query = _context.Employees.AsQueryable();

            var total = await query.CountAsync();

            var data = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<Employee>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            return await _context.Employees.FindAsync(id);
        }

        public async Task AddEmployeeAsync(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmployeeAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            var emp = await _context.Employees.FindAsync(id);
            if (emp != null)
            {
                _context.Employees.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }
    }
}
