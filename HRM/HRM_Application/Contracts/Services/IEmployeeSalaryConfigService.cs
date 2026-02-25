using HRM_Application.DTOs.EmployeeSalaryConfig;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IEmployeeSalaryConfigService
    {
        Task<IEnumerable<EmployeeSalaryConfigDTO>> GetConfigsByEmployeeIdAsync(int employeeId);
        Task<bool> AssignOrUpdateConfigAsync(AssignSalaryConfigDTO request);
        Task<bool> RemoveConfigAsync(int configId);
    }
}
