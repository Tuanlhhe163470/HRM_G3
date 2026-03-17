using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Employee;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Services.HRCore
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly IMapper _mapper;

        public EmployeeService(IEmployeeRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagedResponse<EmployeeResponse>> GetAllEmployeesAsync(PaginationFilter filter)
        {
            var pagedEntities = await _repository.GetAllEmployeesAsync(filter);

            var dtoList = _mapper.Map<List<EmployeeResponse>>(pagedEntities.Data);

            return new PagedResponse<EmployeeResponse>(
                dtoList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords);
        }

        public async Task<EmployeeResponse?> GetEmployeeByIdAsync(int id)
        {
            var employee = await _repository.GetEmployeeByIdAsync(id);
            if (employee == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Nhân viên với ID: {id}");
            }
            return _mapper.Map<EmployeeResponse>(employee);
        }

        public async Task CreateEmployeeAsync(CreateEmployeeRequest request)
        {
            // var isExist = await _repository.IsEmployeeNameExistAsync(request.FullName);
            // if (isExist) throw new InvalidOperationException("Tên nhân viên này đã tồn tại!");

            var entity = _mapper.Map<Employee>(request);

            if (entity.JoinDate == null)
            {
                entity.JoinDate = DateTime.Now;
            }

            await _repository.AddEmployeeAsync(entity);
        }

        public async Task UpdateEmployeeAsync(int id, UpdateEmployeeRequest request)
        {
            var entity = await _repository.GetEmployeeByIdAsync(id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Nhân viên với ID: {id}");
            }

            // Không được tự gán mình làm quản lý của chính mình
            if (request.ManagerID.HasValue && request.ManagerID.Value == id)
            {
                throw new InvalidOperationException("Nhân viên không thể tự làm quản lý của chính mình!");
            }

            _mapper.Map(request, entity);
            await _repository.UpdateEmployeeAsync(entity);
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            var entity = await _repository.GetEmployeeByIdAsync(id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Nhân viên với ID: {id}");
            }

            //Chặn xóa nếu họ đang làm Sếp của người khác
            var isManagerOfSomeone = await _repository.HasEmployeesAsync(id);
            if (isManagerOfSomeone)
            {
                throw new InvalidOperationException("Không thể xóa nhân viên này vì họ đang làm Quản lý của nhân viên khác. Vui lòng chuyển cấp dưới sang người khác trước!");
            }

            await _repository.DeleteEmployeeAsync(id);
        }
        public async Task<PagedResponse<EmployeeResponse>> GetEmployeesByDepartmentAsync(int departmentId, PaginationFilter filter)
        {
            // Gọi repository để lấy dữ liệu đã lọc
            var pagedEntities = await _repository.GetEmployeesByDepartmentAsync(departmentId, filter);

            // Ánh xạ danh sách Entity sang DTO
            var dtoList = _mapper.Map<List<EmployeeResponse>>(pagedEntities.Data);

            return new PagedResponse<EmployeeResponse>(
                dtoList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords);
        }
    }
}