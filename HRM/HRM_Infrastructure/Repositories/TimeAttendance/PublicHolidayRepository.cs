using Azure.Core;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
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
    public class PublicHolidayRepository : IPublicHolidayRepository
    {

        private readonly HRMDbContext _context;
        public PublicHolidayRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task AddPublicHolidayAsync(PublicHoliday publicHoliday)
        {
            await _context.PublicHolidays.AddAsync(publicHoliday);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> CheckOverlapAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.PublicHolidays.AnyAsync(h => startDate <= h.EndDate && endDate >= h.StartDate);
        }

        public async Task DeletePublicHolidayAsync(int id)
        {
            var entity = await _context.PublicHolidays.FindAsync(id);
            if (entity != null)
            {
                _context.PublicHolidays.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<PagedResponse<PublicHoliday>> GetAllPublicHolidaysAsync(PaginationFilter filter)
        {
            var query = _context.PublicHolidays.AsQueryable();

            return await query.ToPagedListAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<PublicHoliday?> GetHolidayByDateAsync(DateTime date)
        {
            return await _context.PublicHolidays
                .FirstOrDefaultAsync(h => date.Date >= h.StartDate.Date && date.Date <= h.EndDate.Date);
        }

        public async Task<PublicHoliday?> GetPublicHolidayByIdAsync(int id)
        {
            return await _context.PublicHolidays.FindAsync(id);
        }

        public async Task UpdatePublicHolidayAsync(PublicHoliday publicHoliday)
        {
            _context.PublicHolidays.Update(publicHoliday);
            await _context.SaveChangesAsync();
        }
        public async Task<List<PublicHoliday>> GetHolidaysInRangeAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.PublicHolidays
                .Where(h => h.StartDate.Date <= toDate.Date && h.EndDate.Date >= fromDate.Date)
                .ToListAsync();
        }
    }
}
