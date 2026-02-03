using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.Shift.Requests;
using HRM_Application.DTOs.Shift.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IShiftService
    {
        Task<PagedResponse<ShiftResponse>> GetAllShiftsAsync(PaginationFilter filter);
        Task<ShiftResponse?> GetShiftByIdAsync(int id);
        Task CreateShiftAsync(CreateShiftRequest request);
        Task UpdateShiftAsync(int id, CreateShiftRequest request);
        Task DeleteShiftAsync(int id);
    }
}
