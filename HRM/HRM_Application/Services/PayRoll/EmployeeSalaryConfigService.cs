using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.PayRoll
{
    public class EmployeeSalaryConfigService : IEmployeeSalaryConfigService
    {
        private readonly IEmployeeSalaryConfigRepository _repository;
        private readonly IMapper _mapper;

        public EmployeeSalaryConfigService(IEmployeeSalaryConfigRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EmployeeSalaryConfigDTO>> GetConfigsByEmployeeIdAsync(int employeeId)
        {
            var entities = await _repository.GetByEmployeeIdAsync(employeeId);
            return _mapper.Map<IEnumerable<EmployeeSalaryConfigDTO>>(entities);
        }

        public async Task<bool> AssignOrUpdateConfigAsync(AssignSalaryConfigDTO request)
        {
            // Kiểm tra xem nhân viên đã có cấu hình cho khoản lương này chưa
            var existingConfig = await _repository.GetConfigByEmployeeAndComponentAsync(request.EmployeeID, request.ComponentID);

            if (existingConfig != null)
            {
                // Nếu có rồi -> Update mức tiền mới
                existingConfig.Amount = request.Amount;
                existingConfig.EffectiveDate = request.EffectiveDate;
                existingConfig.IsActive = true;
                await _repository.UpdateAsync(existingConfig);
            }
            else
            {
                // Nếu chưa có -> Tạo cấu hình mới
                var newConfig = _mapper.Map<EmployeeSalaryConfig>(request);
                newConfig.IsActive = true;
                await _repository.AddAsync(newConfig);
            }
            return true;
        }

        public async Task<bool> RemoveConfigAsync(int configId)
        {
            var config = await _repository.GetByIdAsync(configId);
            if (config == null) return false;

            // Xóa mềm (Soft Delete) để giữ lịch sử nếu cần
            config.IsActive = false;
            await _repository.UpdateAsync(config);
            return true;
        }
    }
}
