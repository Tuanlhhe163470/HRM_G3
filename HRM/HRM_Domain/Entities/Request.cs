using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Request
    {
        [Key]
        public int RequestID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        [StringLength(20)]
        public string RequestType { get; set; } = string.Empty; // Leave, OT, AttendanceCorrection

        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(500)]
        public string? AttachmentUrl { get; set; }

        // Verifier
        public int? ManagerVerifierID { get; set; }
        [ForeignKey("ManagerVerifierID")]
        public virtual Employee? ManagerVerifier { get; set; }
        public DateTime? ManagerVerifiedAt { get; set; }

        // Approver
        public int? HRApproverID { get; set; }
        [ForeignKey("HRApproverID")]
        public virtual Employee? HRApprover { get; set; }
        public DateTime? HRApprovedAt { get; set; }

        [StringLength(20)]
        public string CurrentStep { get; set; } = "Pending Manager";
    }
}
