using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace HRM_Application.Contracts.Repositories
{
    public interface IEmployeeRepository
    {
        Task<PagedResponse<Employee>> GetAllEmployeesAsync(PaginationFilter filter);
        Task<Employee?> GetEmployeeByIdAsync(int id);
        Task AddEmployeeAsync(Employee employee);
        Task UpdateEmployeeAsync(Employee employee);
        Task DeleteEmployeeAsync(int id);
    }
}
