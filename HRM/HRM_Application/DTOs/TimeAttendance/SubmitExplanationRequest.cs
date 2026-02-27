using System;
using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class SubmitExplanationRequest
    {
        [Required(ErrorMessage = "Vui lòng chọn ca làm việc cần giải trình.")]
        public int AttendanceLogId { get; set; }

        [Required(ErrorMessage = "Lý do giải trình không được để trống.")]
        [MaxLength(500, ErrorMessage = "Lý do không được vượt quá 500 ký tự.")]
        public string Reason { get; set; } = string.Empty;

        public string? ProofUrl { get; set; }

        public DateTime? ExpectedCheckInTime { get; set; }
        public DateTime? ExpectedCheckOutTime { get; set; }
    }
}