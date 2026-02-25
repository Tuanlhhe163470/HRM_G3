using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IEmployeeSalaryConfigRepository
    {
        // Thống nhất dùng tên này (bỏ chữ Configs ở giữa)
        Task<IEnumerable<EmployeeSalaryConfig>> GetByEmployeeIdAsync(int employeeId);

        Task<EmployeeSalaryConfig?> GetConfigByEmployeeAndComponentAsync(int employeeId, int componentId);
        Task<EmployeeSalaryConfig?> GetByIdAsync(int id);
        Task AddAsync(EmployeeSalaryConfig entity);
        Task UpdateAsync(EmployeeSalaryConfig entity);
    }
}