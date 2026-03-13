using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.Department.Responses;
using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IDepartmentRepository
    {
        Task<PagedResponse<Department>> GetAllDepartmentsAsync(PaginationFilter filter);

        Task<Department?> GetDepartmentByIdAsync(int id);

        Task<bool> IsDepartmentNameExistAsync(string name);

        Task AddDepartmentAsync(Department department);

        Task UpdateDepartmentAsync(Department department);

        Task DeleteDepartmentAsync(int id);

        Task<bool> HasEmployeesAsync(int departmentId);
    }
}