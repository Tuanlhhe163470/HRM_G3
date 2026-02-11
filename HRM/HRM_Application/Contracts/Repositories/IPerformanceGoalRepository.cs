using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IPerformanceGoalRepository
    {
        Task AddAsync(PerformanceGoal performance);

        Task<IEnumerable<PerformanceGoal>> GetByEmployeeAndCycle(int employeeId, int cycleId);
    }
}
