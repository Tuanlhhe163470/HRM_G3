namespace HRM_Application.DTOs.Leave
{
    public class LeaveBalanceDto
    {
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public double TotalDays { get; set; }
        public double UsedDays { get; set; }
        public double RemainingDays => TotalDays - UsedDays; // Số ngày còn lại 
    }
}