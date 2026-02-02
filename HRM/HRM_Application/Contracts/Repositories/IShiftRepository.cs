using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IShiftRepository
    {
        Task<List<ShiftConfig>> GetAllShiftsAsync();
        Task<ShiftConfig?> GetShiftByIdAsync(int id);
        Task AddShiftAsync(ShiftConfig shift);
        Task UpdateShiftAsync(ShiftConfig shift);
        Task DeleteShiftAsync(int id);
    }
}
