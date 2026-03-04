using HRM_Application.DTOs.Positions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IPositionService
    {
        Task<IEnumerable<PositionResponse>> GetAllPositionsAsync();
        Task<PositionResponse?> GetPositionByIdAsync(int id);
        Task<PositionResponse> CreatePositionAsync(CreatePositionRequest request);
        Task<bool> UpdatePositionAsync(int id, UpdatePositionRequest request);
        Task<bool> DeletePositionAsync(int id);
    }
}
