using System;

namespace HRM_Application.DTOs.Overtime
{
    public class OvertimeRequestHistoryDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Status { get; set; }
        public double ApprovedHours { get; set; } // Số giờ thực tế được tính lương
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}