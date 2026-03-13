using System;
using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.Overtime
{
    public class CreateOvertimeRequestDto
    {
        [Required]
        public DateTime Date { get; set; }
        [Required]
        public TimeSpan StartTime { get; set; }
        [Required]
        public TimeSpan EndTime { get; set; }
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}