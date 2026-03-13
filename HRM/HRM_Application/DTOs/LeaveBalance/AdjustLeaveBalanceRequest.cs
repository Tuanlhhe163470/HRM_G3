using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.LeaveBalance.Requests
{
    public class AdjustLeaveBalanceRequest
    {
        [Range(0, 365, ErrorMessage = "Tổng số ngày phép không hợp lệ")]
        public double NewTotalDays { get; set; }
    }
}