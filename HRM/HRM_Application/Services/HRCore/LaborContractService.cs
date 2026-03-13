using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.LaborContract;
using HRM_Application.DTOs.LaborContract.Responses;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Services.HRCore
{
    public class LaborContractService : ILaborContractService
    {
        private readonly ILaborContractRepository _repository;
        private readonly IMapper _mapper;

        public LaborContractService(ILaborContractRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagedResponse<LaborContractResponse>> GetAllContractsAsync(PaginationFilter filter)
        {
            var pagedEntities = await _repository.GetAllContractsAsync(filter);
            var dtoList = _mapper.Map<List<LaborContractResponse>>(pagedEntities.Data);
            return new PagedResponse<LaborContractResponse>(dtoList, pagedEntities.PageNumber, pagedEntities.PageSize, pagedEntities.TotalRecords);
        }

        public async Task<LaborContractResponse?> GetContractByIdAsync(int id)
        {
            var contract = await _repository.GetContractByIdAsync(id);
            if (contract == null) throw new KeyNotFoundException($"Không tìm thấy Hợp đồng: {id}");
            return _mapper.Map<LaborContractResponse>(contract);
        }

        public async Task CreateContractAsync(CreateLaborContractRequest request)
        {
            if (request.EndDate.HasValue && request.StartDate.HasValue && request.EndDate < request.StartDate)
            {
                throw new InvalidOperationException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu hợp đồng.");
            }

            var entity = _mapper.Map<LaborContract>(request);

            // [BUSINESS RULE]: Nếu tạo mới 1 hợp đồng ACTIVE, phải vô hiệu hóa các hợp đồng cũ
            if (entity.IsActive)
            {
                await _repository.DeactivateOtherContractsAsync(entity.EmployeeID);
            }

            await _repository.AddContractAsync(entity);
        }

        public async Task UpdateContractAsync(int id, UpdateLaborContractRequest request)
        {
            if (request.EndDate.HasValue && request.StartDate.HasValue && request.EndDate < request.StartDate)
            {
                throw new InvalidOperationException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
            }

            var entity = await _repository.GetContractByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException($"Không tìm thấy Hợp đồng: {id}");

            _mapper.Map(request, entity);

            // [BUSINESS RULE]: Nếu update hợp đồng này thành ACTIVE, phải vô hiệu hóa các hợp đồng khác
            if (entity.IsActive)
            {
                await _repository.DeactivateOtherContractsAsync(entity.EmployeeID, entity.ContractID);
            }

            await _repository.UpdateContractAsync(entity);
        }

        public async Task DeleteContractAsync(int id)
        {
            var entity = await _repository.GetContractByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException($"Không tìm thấy Hợp đồng: {id}");
            await _repository.DeleteContractAsync(id);
        }

        public async Task<LaborContractResponse?> GetActiveContractByEmployeeIdAsync(int employeeId)
        {
            var contract = await _repository.GetActiveContractByEmployeeIdAsync(employeeId);
            if (contract == null) return null; // Không ném lỗi, vì nhân viên có thể chưa ký hợp đồng
            return _mapper.Map<LaborContractResponse>(contract);
        }
    }
}