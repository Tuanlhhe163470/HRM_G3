using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HRM_Application.Commons.Pagination;
using HRM_Application.DTOs.PublicHoliday.Requests;
using HRM_Application.DTOs.PublicHoliday.Responses; // Giả sử bạn có DTO trả về

namespace HRM_Application.Contracts.Services
{
    public interface IPublicHolidayService
    {
        Task<PagedResponse<PublicHolidayResponse>> GetAllHolidaysAsync(PaginationFilter filter);
        Task<PublicHolidayResponse> GetHolidayByIdAsync(int id);
        Task CreateHolidayAsync(CreatePublicHolidayRequest request);
        Task UpdateHolidayAsync(int id, UpdatePublicHolidayRequest request);
        Task DeleteHolidayAsync(int id);
    }
}
