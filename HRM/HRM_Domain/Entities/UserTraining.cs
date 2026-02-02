using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class UserTraining
    {
        [Key]
        public long RecordID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int CourseID { get; set; }
        [ForeignKey("CourseID")]
        public virtual TrainingCourse? TrainingCourse { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Assigned";

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercent { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? QuizScore { get; set; }

        [StringLength(500)]
        public string? CertificateUrl { get; set; }

        public DateTime? CompletedDate { get; set; }

        // Integration Point
        public long? AssignedByReviewID { get; set; }
        [ForeignKey("AssignedByReviewID")]
        public virtual Review? AssignedByReview { get; set; }

        public DateTime? DueDate { get; set; }
    }
}
