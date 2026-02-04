using HRM_Application.Commons.Pagination;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IPublicHolidayRepository
    {
        Task<PagedResponse<PublicHoliday>> GetAllPublicHolidaysAsync(PaginationFilter filter);
        Task<PublicHoliday?> GetPublicHolidayByIdAsync(int id);
        Task AddPublicHolidayAsync(PublicHoliday publicHoliday);
        Task UpdatePublicHolidayAsync(PublicHoliday publicHoliday);
        Task DeletePublicHolidayAsync(int id);
    }
}
