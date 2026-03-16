using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Positions;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.HRCore
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;
        private readonly IMapper _mapper;
        public PositionService(IPositionRepository positionRepository, IMapper mapper)
        {
            _positionRepository = positionRepository;
            _mapper = mapper;
        }
        public async Task<PositionResponse> CreatePositionAsync(CreatePositionRequest request)
        {
            bool isExists = await _positionRepository.IsPositionNameExistsAsync(request.PositionName);
            if (isExists)
            {
                throw new InvalidOperationException($"Chức danh '{request.PositionName}' đã tồn tại trong hệ thống.");
            }
            var positionEntity = _mapper.Map<Position>(request);
            var createdEntity = await _positionRepository.AddAsync(positionEntity);
            return _mapper.Map<PositionResponse>(createdEntity);
        }

        public async Task<bool> DeletePositionAsync(int id)
        {
            var position = await _positionRepository.GetByIdAsync(id);
            if (position == null)
                return false;
            await _positionRepository.DeleteAsync(position);
            return true;
        }

        public async Task<IEnumerable<PositionResponse>> GetAllPositionsAsync()
        {
            var positions = await _positionRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<PositionResponse>>(positions);
        }

        public async Task<PositionResponse?> GetPositionByIdAsync(int id)
        {
            var position = await _positionRepository.GetByIdAsync(id);
            return _mapper.Map<PositionResponse?>(position);
        }

        public async Task<bool> UpdatePositionAsync(int id, UpdatePositionRequest request)
        {
            var existingPosition = await _positionRepository.GetByIdAsync(id);
            if (existingPosition == null) return false;

            bool isExists = await _positionRepository.IsPositionNameExistsAsync(request.PositionName, id);
            if (isExists)
            {
                throw new InvalidOperationException($"Chức danh '{request.PositionName}' đã tồn tại ở một bản ghi khác.");
            }

            _mapper.Map(request, existingPosition);
            existingPosition.PositionID = id;

            await _positionRepository.UpdateAsync(existingPosition);
            return true;
        }
    }
}
