using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.HRCore
{
    public class LaborContractRepository : ILaborContractRepository
    {
        private readonly HRMDbContext _context;
        public LaborContractRepository(HRMDbContext context) { _context = context; }

        public async Task<PagedResponse<LaborContract>> GetAllContractsAsync(PaginationFilter filter)
        {
            var query = _context.LaborContracts
                .Include(c => c.Employee)
                .AsQueryable();

            var totalRecords = await query.CountAsync();
            var data = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResponse<LaborContract>(data, filter.PageNumber, filter.PageSize, totalRecords);
        }

        public async Task<LaborContract?> GetContractByIdAsync(int id)
        {
            return await _context.LaborContracts
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.ContractID == id);
        }

        public async Task AddContractAsync(LaborContract contract)
        {
            await _context.LaborContracts.AddAsync(contract);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateContractAsync(LaborContract contract)
        {
            _context.LaborContracts.Update(contract);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteContractAsync(int id)
        {
            var contract = await _context.LaborContracts.FindAsync(id);
            if (contract != null)
            {
                _context.LaborContracts.Remove(contract);
                await _context.SaveChangesAsync();
            }
        }

        // --- TRIỂN KHAI NGHIỆP VỤ ---

        public async Task DeactivateOtherContractsAsync(int employeeId, int? excludeContractId = null)
        {
            // Lấy tất cả hợp đồng ĐANG ACTIVE của nhân viên này (trừ cái đang thao tác)
            var activeContracts = await _context.LaborContracts
                .Where(c => c.EmployeeID == employeeId
                         && c.IsActive == true
                         && c.ContractID != excludeContractId)
                .ToListAsync();

            if (activeContracts.Any())
            {
                foreach (var contract in activeContracts)
                {
                    contract.IsActive = false; // Gạch bỏ hợp đồng cũ
                }
                _context.LaborContracts.UpdateRange(activeContracts);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<LaborContract?> GetActiveContractByEmployeeIdAsync(int employeeId)
        {
            // Trả về Hợp đồng duy nhất đang Active
            return await _context.LaborContracts
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.EmployeeID == employeeId && c.IsActive == true);
        }
    }
}