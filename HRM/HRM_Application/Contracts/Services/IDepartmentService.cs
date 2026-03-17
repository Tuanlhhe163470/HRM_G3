using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.Commons;
using HRM_Application.DTOs.Department.Requests;
using HRM_Application.DTOs.Department.Responses;

namespace HRM_Application.Contracts.Services
{
    public interface IDepartmentService
    {
        Task<PagedResponse<DepartmentResponse>> GetAllDepartmentsAsync(PaginationFilter filter);
        Task<DepartmentResponse?> GetDepartmentByIdAsync(int id);
        Task CreateDepartmentAsync(CreateDepartmentRequest request);
        Task UpdateDepartmentAsync(int id, UpdateDepartmentRequest request);
        Task DeleteDepartmentAsync(int id);
        Task<IEnumerable<BaseReferenceResponse>> GetEmployeesByDepartmentAsync(int departmentId);
    }
}