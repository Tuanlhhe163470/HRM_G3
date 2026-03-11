using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Department.Requests;
using HRM_Application.DTOs.Department.Responses;
using HRM_Domain.Entities;

namespace HRM_Application.Services.Department
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;
        private readonly IMapper _mapper;

        public DepartmentService(IDepartmentRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagedResponse<DepartmentResponse>> GetAllDepartmentsAsync(PaginationFilter filter)
        {
            var departments = await _repository.GetAllDepartmentsAsync(filter);
            var result = _mapper.Map<List<DepartmentResponse>>(departments.Data);

            return new PagedResponse<DepartmentResponse>(
                result,
                departments.PageNumber,
                departments.PageSize,
                departments.TotalRecords);
        }

        public async Task<DepartmentResponse?> GetDepartmentByIdAsync(int id)
        {
            var deptEntity = await _repository.GetDepartmentByIdAsync(id);
            if (deptEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Phòng ban với ID: {id}");
            }
            return _mapper.Map<DepartmentResponse>(deptEntity);
        }

        public async Task CreateDepartmentAsync(CreateDepartmentRequest request)
        {
            var isExist = await _repository.IsDepartmentNameExistAsync(request.DepartmentName);
            if (isExist)
            {
                throw new InvalidOperationException($"Phòng ban mang tên '{request.DepartmentName}' đã tồn tại!");
            }

            var deptEntity = _mapper.Map<HRM_Domain.Entities.Department>(request);
            await _repository.AddDepartmentAsync(deptEntity);
        }

        public async Task UpdateDepartmentAsync(int id, UpdateDepartmentRequest request)
        {
            var deptEntity = await _repository.GetDepartmentByIdAsync(id);
            if (deptEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Phòng ban với ID: {id}");
            }

            _mapper.Map(request, deptEntity);
            await _repository.UpdateDepartmentAsync(deptEntity);
        }

        public async Task DeleteDepartmentAsync(int id)
        {
            var deptEntity = await _repository.GetDepartmentByIdAsync(id);
            if (deptEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Phòng ban với ID: {id}");
            }

            var hasEmployees = await _repository.HasEmployeesAsync(id);
            if (hasEmployees)
            {
                throw new InvalidOperationException("Không thể xóa phòng ban đang có nhân viên. Vui lòng thuyên chuyển nhân viên trước!");
            }

            await _repository.DeleteDepartmentAsync(id);
        }
    }
}