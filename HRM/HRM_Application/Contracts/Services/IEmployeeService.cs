using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.Employees.Requests;
using HRM_Application.DTOs.Employees.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IEmployeeService
    {
        Task<PagedResponse<EmployeeResponse>> GetAllEmployeesAsync(PaginationFilter filter);
        Task<EmployeeResponse> GetEmployeeByIdAsync(int id);
        Task CreateEmployeeAsync(CreateEmployeeRequest request);
        Task UpdateEmployeeAsync(int id, UpdateEmployeeRequest request);
        Task DeleteEmployeeAsync(int id);
    }
}
