using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Employees.Requests;
using HRM_Application.DTOs.Employees.Responses;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.CoreHR
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repo;
        private readonly IMapper _mapper;

        public EmployeeService(IEmployeeRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<PagedResponse<EmployeeResponse>> GetAllEmployeesAsync(PaginationFilter filter)
        {
            var result = await _repo.GetAllEmployeesAsync(filter);

            var mapped = _mapper.Map<List<EmployeeResponse>>(result.Data);

            return new PagedResponse<EmployeeResponse>(
                mapped,
                result.TotalRecords,
                result.PageNumber,
                result.PageSize
            );
        }

        public async Task<EmployeeResponse> GetEmployeeByIdAsync(int id)
        {
            var emp = await _repo.GetEmployeeByIdAsync(id);
            if (emp == null) throw new Exception("Employee not found");

            return _mapper.Map<EmployeeResponse>(emp);
        }

        public async Task CreateEmployeeAsync(CreateEmployeeRequest request)
        {
            var emp = _mapper.Map<Employee>(request);
            await _repo.AddEmployeeAsync(emp);
        }

        public async Task UpdateEmployeeAsync(int id, UpdateEmployeeRequest request)
        {
            var emp = await _repo.GetEmployeeByIdAsync(id);
            if (emp == null) throw new Exception("Employee not found");

            _mapper.Map(request, emp);
            await _repo.UpdateEmployeeAsync(emp);
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            await _repo.DeleteEmployeeAsync(id);
        }
    }
}
