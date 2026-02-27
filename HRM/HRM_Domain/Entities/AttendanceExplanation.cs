using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class AttendanceExplanation
    {
        [Key]
        public int Id { get; set; }

        public int AttendanceLogId { get; set; }
        [ForeignKey("AttendanceLogId")]
        public virtual AttendanceLog AttendanceLog { get; set; }

        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        public string? ProofUrl { get; set; } 

        public DateTime? ExpectedCheckInTime { get; set; }
        public DateTime? ExpectedCheckOutTime { get; set; }

        public ExplanationStatus Status { get; set; } = ExplanationStatus.PendingManager;

        public int? ManagerId { get; set; }
        public DateTime? ManagerActionDate { get; set; }
        [MaxLength(255)]
        public string? ManagerNote { get; set; } 

        public int? HRAdminId { get; set; }
        public DateTime? HRActionDate { get; set; }
        [MaxLength(255)]
        public string? HRNote { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}
