using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.LeaveBalance.Requests
{
    public class GenerateLeaveBalanceRequest
    {
        [Required]
        public int Year { get; set; }

        [Required]
        public int LeaveTypeId { get; set; } // VD: 1 là Phép năm (Annual Leave)

        [Range(1, 365)]
        public double DefaultDays { get; set; } = 12.0; // Mặc định luật lao động là 12 ngày
    }
}