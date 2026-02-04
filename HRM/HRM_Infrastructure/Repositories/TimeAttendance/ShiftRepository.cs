using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Infrastructure.Data;
using HRM_Infrastructure.Extensions;
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

        public async Task DeleteShiftAsync(int id)
        {
            var entity = await _context.ShiftConfigs.FindAsync(id);
            if (entity != null)
            {
                _context.ShiftConfigs.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<PagedResponse<ShiftConfig>> GetAllShiftsAsync(PaginationFilter filter)
        {
            var query = _context.ShiftConfigs.AsQueryable();

            return await query.ToPagedListAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<ShiftConfig?> GetShiftByIdAsync(int id)
        {
            return await _context.ShiftConfigs.FindAsync(id);
        }

        public async Task UpdateShiftAsync(ShiftConfig shift)
        {
            _context.ShiftConfigs.Update(shift);
            await _context.SaveChangesAsync();
        }
    }
}
