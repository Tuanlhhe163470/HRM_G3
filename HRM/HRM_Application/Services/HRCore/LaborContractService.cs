using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.LaborContract;
using HRM_Application.DTOs.LaborContract.Responses;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.HRCore
{
    public class LaborContractService : ILaborContractService
    {
        private readonly ILaborContractRepository _repository;
        private readonly IMapper _mapper;
        private readonly IOfferRepository _offerRepository;    
        private readonly IEmployeeRepository _employeeRepository; 
        public LaborContractService(ILaborContractRepository repository, IOfferRepository offerRepository,
            IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _repository = repository;
            _offerRepository = offerRepository;
            _employeeRepository = employeeRepository;
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
        public async Task<CreateLaborContractRequest> PrepareContractFromOfferAsync(int candidateId)
        {
            // 1. Lấy Offer mới nhất của ứng viên này
            var offers = await _offerRepository.GetOffersByCandidateIdAsync(candidateId);
            var latestOffer = offers?.OrderByDescending(o => o.OfferedDate).FirstOrDefault();

            if (latestOffer == null)
            {
                throw new KeyNotFoundException("Không tìm thấy thông tin Offer cho ứng viên này để tạo hợp đồng.");
            }

            // 2. Tìm nhân viên đã được tạo từ Candidate này (Cần hàm GetByCandidateId trong EmployeeRepo)
            var employee = await _employeeRepository.GetByCandidateIdAsync(candidateId);

            if (employee == null)
            {
                throw new InvalidOperationException("Ứng viên này chưa được chuyển thành nhân viên. Vui lòng xác nhận trúng tuyển trước.");
            }

            // 3. Map dữ liệu từ Offer sang Request Hợp đồng
            return new CreateLaborContractRequest
            {
                EmployeeID = employee.EmployeeID,
                BaseSalary = latestOffer.OfferedSalary, // Lấy lương từ Offer
                StartDate = latestOffer.JoinDate,       // Lấy ngày bắt đầu từ Offer
                ContractType = "Hợp đồng thử việc",     // Gợi ý mặc định
                SignedDate = DateTime.Now,
                IsActive = true
            };
        }
        public async Task<IEnumerable<HRM_Application.DTOs.Employee.EmployeeResponse>> GetEmployeesWithoutContractAsync()
        {
            // 1. Lấy tất cả nhân viên
            var allEmployees = await _employeeRepository.GetAllEmployeesAsync();

            // 2. Lọc ra những người chưa có hợp đồng nào đang ở trạng thái IsActive = true
            var employeesWithoutContract = new List<Employee>();

            foreach (var emp in allEmployees)
            {
                var activeContract = await _repository.GetActiveContractByEmployeeIdAsync(emp.EmployeeID);
                if (activeContract == null)
                {
                    employeesWithoutContract.Add(emp);
                }
            }

            return _mapper.Map<IEnumerable<HRM_Application.DTOs.Employee.EmployeeResponse>>(employeesWithoutContract);
        }
    }
}