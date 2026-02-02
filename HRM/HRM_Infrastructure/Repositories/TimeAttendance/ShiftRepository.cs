using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.TimeAttendance
{
    public class ShiftRepository : IShiftRepository
    {
        private readonly HRMDbContext _context;
        public ShiftRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task AddShiftAsync(ShiftConfig shift)
        {
            await _context.ShiftConfigs.AddAsync(shift);
            await _context.SaveChangesAsync();
        }

        public Task DeleteShiftAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<ShiftConfig>> GetAllShiftsAsync()
        {
            return await _context.ShiftConfigs.ToListAsync();
        }

        public Task<ShiftConfig?> GetShiftByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateShiftAsync(ShiftConfig shift)
        {
            throw new NotImplementedException();
        }
    }
}
