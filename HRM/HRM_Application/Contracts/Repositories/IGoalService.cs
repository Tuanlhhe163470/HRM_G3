using HRM_Domain.Entities;
using HRM_Application.DTOs.Goals;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IGoalService
    {
        Task<PerformanceGoal> CreateGoal(CreateGoalDTO request);
    }
}
