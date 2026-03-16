using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IEmployeeRepository
    {
        Task<PagedResponse<Employee>> GetAllEmployeesAsync(PaginationFilter filter);
        Task<Employee?> GetEmployeeByIdAsync(int id);

        Task<bool> IsEmployeeNameExistAsync(string name);

        Task AddEmployeeAsync(Employee employee);

        Task UpdateEmployeeAsync(Employee employee);

        Task DeleteEmployeeAsync(int id);

        Task<bool> HasEmployeesAsync(int employeeId);
        Task<IEnumerable<Employee>> GetAllEmployeesAsync();
    }
}