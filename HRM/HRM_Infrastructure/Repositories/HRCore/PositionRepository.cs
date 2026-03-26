using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.HRCore
{
    public class PositionRepository : IPositionRepository
    {
        private readonly HRMDbContext _context;

        public PositionRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<Position> AddAsync(Position position)
        {
            await _context.Positions.AddAsync(position);
            await _context.SaveChangesAsync();
            return position;
        }

        public async Task DeleteAsync(Position position)
        {
            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Position>> GetAllAsync()
        {
            return await _context.Positions.ToListAsync();
        }

        public async Task<Position?> GetByIdAsync(int id)
        {
            return await _context.Positions.FindAsync(id);
        }

        public async Task UpdateAsync(Position position)
        {
            _context.Positions.Update(position);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsPositionNameExistsAsync(string positionName, int? excludeId = null)
        {
            var query = _context.Positions.Where(p => p.PositionName.ToLower() == positionName.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.PositionID != excludeId.Value);
            }

            return await query.AnyAsync();
        }
        public async Task<bool> HasEmployeesAsync(int id)
        {
            return await _context.Employees.AnyAsync(e => e.PositionID == id);
        }
    }
}
