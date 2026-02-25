using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAllEmployeesAsync();
        Task<Employee?> GetByIdAsync(int id);
    }
}