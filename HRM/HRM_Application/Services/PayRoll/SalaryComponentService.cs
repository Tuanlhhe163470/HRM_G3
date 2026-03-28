using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll; // Đảm bảo DTO nằm đúng namespace này
using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.PayRoll
{
    public class SalaryComponentService : ISalaryComponentService
    {
        private readonly ISalaryComponentRepository _repository;
        private readonly IMapper _mapper;

        public SalaryComponentService(ISalaryComponentRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SalaryComponentDTO>> GetAllComponentsAsync()
        {
            var components = await _repository.GetAllAsync();

            // Sắp xếp ID giảm dần để thấy cái mới tạo lên đầu
            return _mapper.Map<IEnumerable<SalaryComponentDTO>>(components.OrderByDescending(x => x.ComponentID));
        }

        public async Task<IEnumerable<SalaryComponentDTO>> GetActiveComponentsAsync()
        {
            var components = await _repository.GetAllAsync();

            // Lọc IsActive = true
            var activeComponents = components.Where(x => x.IsActive).OrderBy(x => x.ComponentName);

            return _mapper.Map<IEnumerable<SalaryComponentDTO>>(activeComponents);
        }

        // Lấy chi tiết theo ID
        public async Task<SalaryComponentDTO?> GetComponentByIdAsync(int id)
        {
            var component = await _repository.GetByIdAsync(id);
            if (component == null) return null;
            return _mapper.Map<SalaryComponentDTO>(component);
        }

        // Tạo mới
        public async Task<SalaryComponentDTO> CreateComponentAsync(CreateSalaryComponentDTO request)
        {
            var entity = _mapper.Map<SalaryComponent>(request);

            // Mặc định khi tạo mới thì luôn Active
            entity.IsActive = true;

            var result = await _repository.AddAsync(entity);
            return _mapper.Map<SalaryComponentDTO>(result);
        }

        public async Task<bool> UpdateComponentAsync(int id, UpdateSalaryComponentDTO request)
        {
            var existingComponent = await _repository.GetByIdAsync(id);
            if (existingComponent == null) return false;

            // AutoMapper sẽ chép dữ liệu từ DTO sang Entity (bao gồm cả ComponentName, Type, Amount, IsActive...)
            _mapper.Map(request, existingComponent);

            await _repository.UpdateAsync(existingComponent);
            return true;
        }

        public async Task<bool> DeleteComponentAsync(int id)
        {
            var component = await _repository.GetByIdAsync(id);
            if (component == null) return false;

            component.IsActive = false;

            // thay đổi trạng thái
            await _repository.UpdateAsync(component);

            return true;
        }
    }
}