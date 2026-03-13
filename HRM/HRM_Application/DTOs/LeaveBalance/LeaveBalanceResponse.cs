using HRM_Application.DTOs.Commons;

namespace HRM_Application.DTOs.LeaveBalance.Responses
{
    public class LeaveBalanceResponse
    {
        public int Id { get; set; }

        public BaseReferenceResponse? Employee { get; set; }
        public BaseReferenceResponse? LeaveType { get; set; }

        public int Year { get; set; }
        public double TotalDays { get; set; }
        public double UsedDays { get; set; }
        public double RemainingDays => TotalDays - UsedDays;
    }
}