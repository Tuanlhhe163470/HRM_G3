namespace HRM_Application.DTOs.Leave
{
    public class LeaveRequestHistoryDto
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }

        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? ManagerNote { get; set; }
    }
}