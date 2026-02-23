using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.Shift.Requests
{
    public class CreateShiftRequest
    {
        [Required(ErrorMessage = "Tên ca là bắt buộc")]
        public string ShiftName { get; set; } = string.Empty;

        // Nhận chuỗi "HH:mm" (VD: "08:00")
        [Required]
        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Định dạng giờ phải là HH:mm")]
        public string StartTime { get; set; }

        [Required]
        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Định dạng giờ phải là HH:mm")]
        public string EndTime { get; set; }

        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }

        [Range(0, 120, ErrorMessage = "Số phút đi muộn từ 0-120")]
        public int AllowedLateMinutes { get; set; } = 0;

        [Range(0, 120, ErrorMessage = "Số phút về sớm từ 0-120")]
        public int AllowedEarlyLeaveMinutes { get; set; } = 0;

        public List<int> WorkDays { get; set; } = new List<int> { 1, 2, 3, 4, 5 };
    }
}