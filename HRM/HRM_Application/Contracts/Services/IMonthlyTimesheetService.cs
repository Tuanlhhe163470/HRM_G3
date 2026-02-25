using HRM_Application.DTOs.MonthlyTimesheet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IMonthlyTimesheetService
    {
        Task<List<MonthlyTimesheetResponse>> GetCompanyTimesheetsAsync(int month, int year);
    }
}
