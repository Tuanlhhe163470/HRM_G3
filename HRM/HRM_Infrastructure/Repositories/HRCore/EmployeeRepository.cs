using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.HRCore
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly HRMDbContext _context;

        public EmployeeRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .ToListAsync();
        }

        public async Task<PagedResponse<Employee>> GetAllEmployeesAsync(PaginationFilter filter)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .AsQueryable();

            var totalRecords = await query.CountAsync();

            var data = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<Employee>(data, filter.PageNumber, filter.PageSize, totalRecords);
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.EmployeeID == id);
        }

     
        public async Task<Employee?> GetByCandidateIdAsync(int candidateId)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.CandidateID == candidateId);
        }

        public async Task AddEmployeeAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmployeeAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasEmployeesAsync(int employeeId)
        {
            return await _context.Employees.AnyAsync(e => e.ManagerID == employeeId);
        }

        public async Task<bool> IsEmployeeNameExistAsync(string name)
        {
            return await _context.Employees.AnyAsync(e => e.FullName.ToLower() == name.ToLower());
        }
        public async Task<PagedResponse<Employee>> GetEmployeesByDepartmentAsync(int departmentId, PaginationFilter filter)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .Where(e => e.DepartmentID == departmentId) // Lọc theo phòng ban
                .AsQueryable();

            var totalRecords = await query.CountAsync();

            var data = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<Employee>(data, filter.PageNumber, filter.PageSize, totalRecords);
        }
    }
}