using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HRM_Domain.Enums; // Dùng chung ExplanationStatus cho tiện

namespace HRM_Domain.Entities
{
    public class LeaveRequest
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }

        public int LeaveTypeId { get; set; }
        [ForeignKey("LeaveTypeId")]
        public virtual LeaveType LeaveType { get; set; }

        [Required]
        public DateTime StartDate { get; set; } // Nghỉ từ ngày

        [Required]
        public DateTime EndDate { get; set; } // Đến ngày

        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        public ExplanationStatus Status { get; set; } = ExplanationStatus.PendingManager;

        public int? ManagerId { get; set; }
        public DateTime? ManagerActionDate { get; set; }
        public string? ManagerNote { get; set; }

        public int? HRAdminId { get; set; }
        public DateTime? HRActionDate { get; set; }
        public string? HRNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}