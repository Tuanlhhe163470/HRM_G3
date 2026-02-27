using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.Leave
{
    public class CreateLeaveRequestDto
    {
        [Required(ErrorMessage = "Vui lòng chọn loại phép.")]
        public int LeaveTypeId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ngày bắt đầu.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ngày kết thúc.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập lý do nghỉ.")]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}