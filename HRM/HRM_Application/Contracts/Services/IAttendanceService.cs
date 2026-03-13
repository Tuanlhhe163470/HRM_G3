using HRM_Application.DTOs.MonthlyTimesheet;
using HRM_Application.DTOs.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IAttendanceService
    {
        Task<AttendanceLogResponse> CheckInAsync(int employeeId, CheckInRequest request);

        // Check-out
        Task<AttendanceLogResponse> CheckOutAsync(int employeeId, CheckOutRequest request);
        Task<MyTimesheetSummaryResponse> GetMyAttendanceLogsAsync(int employeeId, int month, int year);
        Task CalculateCompanyTimesheetAsync(int month, int year);
    }
}
