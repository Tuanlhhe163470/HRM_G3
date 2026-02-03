using HRM_Infrastructure.Data;
using HRM_Domain.Entities;
using HRM_Application.Contracts.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.Repositories.PerformanceGoal
{
    public class PerformanceGoalRepository : IPerformanceGoalRepository
    {

        private readonly HRMDbContext _context;
        public PerformanceGoalRepository(HRMDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(HRM_Domain.Entities.PerformanceGoal performance)
        {
            await _context.PerformanceGoals.AddAsync(performance);
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<HRM_Domain.Entities.PerformanceGoal>> GetByEmployeeAndCycle(int employeeId, int cycleId)
        {
            return await _context.PerformanceGoals
        .Where(g => g.EmployeeID == employeeId && g.CycleID == cycleId)
        .ToListAsync();
        }
    }
}
