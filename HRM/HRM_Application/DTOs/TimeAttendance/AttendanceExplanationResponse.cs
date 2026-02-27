using HRM_Domain.Enums;
using System;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class AttendanceExplanationResponse
    {
        public int Id { get; set; }
        public int AttendanceLogId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string? AvatarUrl { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? ProofUrl { get; set; }

        public DateTime? ExpectedCheckInTime { get; set; }
        public DateTime? ExpectedCheckOutTime { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ManagerNote { get; set; }
        public string? HRNote { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? ShiftName { get; set; }
        public DateTime? WorkDate { get; set; }
    }
}