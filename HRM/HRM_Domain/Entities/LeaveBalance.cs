using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM_Domain.Entities
{
    public class LeaveBalance
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }

        public int LeaveTypeId { get; set; }
        [ForeignKey("LeaveTypeId")]
        public virtual LeaveType LeaveType { get; set; }

        public int Year { get; set; } // Quỹ phép của năm nào (VD: 2026)

        public double TotalDays { get; set; } // Tổng số ngày được cấp (VD: 12 ngày)

        public double UsedDays { get; set; } // Số ngày đã nghỉ (VD: 7.5 ngày)
    }
}