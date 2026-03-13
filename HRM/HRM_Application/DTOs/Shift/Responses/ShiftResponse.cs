namespace HRM_Application.DTOs.Shift.Responses
{
    public class ShiftResponse
    {
        public int Id { get; set; }
        public string ShiftName { get; set; } = string.Empty;

        public string StartTime { get; set; }
        public string EndTime { get; set; }

        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }

        public int AllowedLateMinutes { get; set; }
        public int AllowedEarlyLeaveMinutes { get; set; }

        public bool IsActive { get; set; }

        public List<int> WorkDays { get; set; } = new List<int>();
    }
}