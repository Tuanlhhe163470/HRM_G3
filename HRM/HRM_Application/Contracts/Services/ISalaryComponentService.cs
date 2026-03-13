using HRM_Application.DTOs.PayRoll;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface ISalaryComponentService
    {
        Task<IEnumerable<SalaryComponentDTO>> GetAllComponentsAsync();
        Task<SalaryComponentDTO?> GetComponentByIdAsync(int id);
        Task<SalaryComponentDTO> CreateComponentAsync(CreateSalaryComponentDTO request);
        Task<bool> UpdateComponentAsync(int id, UpdateSalaryComponentDTO request);
        Task<bool> DeleteComponentAsync(int id); // Soft delete hoặc Hard delete tùy nghiệp vụ
        Task<IEnumerable<SalaryComponentDTO>> GetActiveComponentsAsync();
    }
}
