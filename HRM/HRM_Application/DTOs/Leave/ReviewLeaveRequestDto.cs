using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.Leave
{
    public class ReviewLeaveRequestDto
    {
        [Required]
        public bool IsApproved { get; set; } // true: Duyệt, false: Từ chối

        public string? Note { get; set; } // Bắt buộc nếu từ chối
    }
}