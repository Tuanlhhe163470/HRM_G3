using System;

namespace HRM_Application.DTOs.MonthlyTimesheet
{
    public class MonthlyTimesheetResponse
    {
        public int TimesheetID { get; set; }
        public int EmployeeID { get; set; }

        // Thông tin nhân viên (Lấy từ bảng Employee)
        public string EmployeeName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string PositionName { get; set; } = string.Empty;

        // Dữ liệu chấm công
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal StandardWorkDays { get; set; }
        public decimal ActualWorkDays { get; set; }
        public decimal PaidLeaveDays { get; set; }
        public decimal UnpaidLeaveDays { get; set; }

        public double TotalWorkingHours { get; set; }
        public int TotalLateMinutes { get; set; }
        public int TotalEarlyLeaveMinutes { get; set; }

        public string Status { get; set; } = string.Empty;
        public DateTime? LastCalculatedDate { get; set; }

        public Dictionary<int, string> DailyStatuses { get; set; } = new Dictionary<int, string>();
    }
}