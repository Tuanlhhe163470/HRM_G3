using HRM_Domain.Entities;

namespace HRM_Application.Contracts.Repositories
{
    public interface IPositionRepository
    {
        Task<IEnumerable<Position>> GetAllAsync();
        Task<Position?> GetByIdAsync(int id);
        Task<Position> AddAsync(Position position);
        Task UpdateAsync(Position position);
        Task DeleteAsync(Position position);
        Task<bool> IsPositionNameExistsAsync(string positionName, int? excludeId = null);
    }
}