using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class ReviewExplanationRequest
    {
        [Required(ErrorMessage = "Vui lòng xác nhận quyết định (Duyệt / Từ chối).")]
        public bool IsApproved { get; set; } // true = Duyệt, false = Từ chối

        [MaxLength(255, ErrorMessage = "Ghi chú không được vượt quá 255 ký tự.")]
        public string? Note { get; set; } // Lời nhắn của người duyệt (Bắt buộc nếu Từ chối)
    }
}