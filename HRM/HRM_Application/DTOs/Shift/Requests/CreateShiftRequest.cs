using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace HRM_Application.DTOs.Shift.Requests
{
    public class CreateShiftRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Tên ca là bắt buộc")]
        public string ShiftName { get; set; } = string.Empty;

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
        public bool IsForceUpdate { get; set; } = false;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (TimeSpan.TryParse(StartTime, out var start) && TimeSpan.TryParse(EndTime, out var end))
            {
                // 1. Giờ kết thúc ca phải lớn hơn giờ bắt đầu ca
                if (end <= start)
                {
                    yield return new ValidationResult("Giờ kết thúc ca phải lớn hơn giờ bắt đầu.", new[] { nameof(EndTime) });
                }

                // 2. Kiểm tra giờ nghỉ trưa 
                if (!string.IsNullOrEmpty(BreakStartTime) && !string.IsNullOrEmpty(BreakEndTime))
                {
                    if (TimeSpan.TryParse(BreakStartTime, out var breakStart) && TimeSpan.TryParse(BreakEndTime, out var breakEnd))
                    {
                        if (breakEnd <= breakStart)
                        {
                            yield return new ValidationResult("Giờ kết thúc nghỉ phải lớn hơn giờ bắt đầu nghỉ.", new[] { nameof(BreakEndTime) });
                        }

                        // Giờ nghỉ trưa KHÔNG ĐƯỢC lọt ra ngoài khung giờ làm việc
                        if (breakStart < start || breakEnd > end)
                        {
                            yield return new ValidationResult(
                                "Giờ nghỉ trưa phải nằm trong khoảng thời gian làm việc của ca.",
                                new[] { nameof(BreakStartTime), nameof(BreakEndTime) }
                            );
                        }
                    }
                }
            }
        }
    }
}