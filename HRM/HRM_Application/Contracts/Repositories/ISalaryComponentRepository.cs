using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface ISalaryComponentRepository
    {
        Task<IEnumerable<SalaryComponent>> GetAllAsync();
        Task<SalaryComponent?> GetByIdAsync(int id);
        Task<SalaryComponent> AddAsync(SalaryComponent entity);
        Task UpdateAsync(SalaryComponent entity);
        Task DeleteAsync(SalaryComponent entity);
    }
}
