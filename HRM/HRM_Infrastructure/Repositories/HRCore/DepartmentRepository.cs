using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.DTOs.Commons;
using HRM_Application.DTOs.Department.Responses;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly HRMDbContext _context;

        public DepartmentRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<Department>> GetAllDepartmentsAsync(PaginationFilter filter)
        {
            var query = _context.Departments
                .Include(d => d.Manager)
                .AsQueryable();

            var totalRecords = await query.CountAsync();

            var data = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<Department>(data, filter.PageNumber, filter.PageSize, totalRecords);
        }

        public async Task<Department?> GetDepartmentByIdAsync(int id)
        {
            return await _context.Departments
                .Include(d => d.Manager)
                .FirstOrDefaultAsync(d => d.DepartmentID == id);
        }

        public async Task<bool> IsDepartmentNameExistAsync(string name)
        {
            return await _context.Departments
                .AnyAsync(d => d.DepartmentName.ToLower() == name.ToLower());
        }

        public async Task AddDepartmentAsync(Department department)
        {
            await _context.Departments.AddAsync(department);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDepartmentAsync(Department department)
        {
            _context.Departments.Update(department);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDepartmentAsync(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department != null)
            {
                _context.Departments.Remove(department);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasEmployeesAsync(int departmentId)
        {
            return await _context.Employees
                .AnyAsync(e => e.DepartmentID == departmentId);
        }
        public async Task<IEnumerable<HRM_Domain.Entities.Employee>> GetEmployeesByDepartmentIdAsync(int departmentId)
        {
            // Truy vấn danh sách nhân viên lọc theo DepartmentID
            return await _context.Employees
                .Where(e => e.DepartmentID == departmentId)
                .ToListAsync();
        }
    }
}