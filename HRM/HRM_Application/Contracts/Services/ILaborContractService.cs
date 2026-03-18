using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.LaborContract;
using HRM_Application.DTOs.LaborContract.Responses;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface ILaborContractService
    {
        Task<PagedResponse<LaborContractResponse>> GetAllContractsAsync(PaginationFilter filter);
        Task<LaborContractResponse?> GetContractByIdAsync(int id);
        Task CreateContractAsync(CreateLaborContractRequest request);
        Task UpdateContractAsync(int id, UpdateLaborContractRequest request);
        Task DeleteContractAsync(int id);
        Task<LaborContractResponse?> GetActiveContractByEmployeeIdAsync(int employeeId);
        Task<CreateLaborContractRequest> PrepareContractFromOfferAsync(int candidateId);
        Task<IEnumerable<HRM_Application.DTOs.Employee.EmployeeResponse>> GetEmployeesWithoutContractAsync();
    }
}
