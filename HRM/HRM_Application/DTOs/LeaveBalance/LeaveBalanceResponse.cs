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

        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string PositionName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;

        // Cờ nhận biết nhân viên này đã có quỹ phép chưa (true = rồi, false = chưa)
        public bool IsAllocated { get; set; }
    }
}