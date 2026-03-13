using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.PayRoll
{
    public class SalaryComponentRepository : ISalaryComponentRepository
    {
        private readonly HRMDbContext _context;

        public SalaryComponentRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SalaryComponent>> GetAllAsync()
        {
            return await _context.SalaryComponents.ToListAsync();
        }

        public async Task<SalaryComponent?> GetByIdAsync(int id)
        {
            return await _context.SalaryComponents.FindAsync(id);
        }

        public async Task<SalaryComponent> AddAsync(SalaryComponent entity)
        {
            await _context.SalaryComponents.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(SalaryComponent entity)
        {
            _context.SalaryComponents.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SalaryComponent entity)
        {
            _context.SalaryComponents.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
