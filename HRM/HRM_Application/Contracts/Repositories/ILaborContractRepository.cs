using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface ILaborContractRepository
    {
        Task<PagedResponse<LaborContract>> GetAllContractsAsync(PaginationFilter filter);
        Task<LaborContract?> GetContractByIdAsync(int id);
        Task AddContractAsync(LaborContract contract);
        Task UpdateContractAsync(LaborContract contract);
        Task DeleteContractAsync(int id);

        // IsActive hết các hợp đồng cũ của 1 nhân viên
        Task DeactivateOtherContractsAsync(int employeeId, int? excludeContractId = null);

        Task<LaborContract?> GetActiveContractByEmployeeIdAsync(int employeeId);
    }
}