using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class JobPosting
    {
        [Key]
        public int JobID { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public int? DepartmentID { get; set; }
        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }

        public int? PositionID { get; set; }
        [ForeignKey("PositionID")]
        public virtual Position? Position { get; set; }

        public string Description { get; set; } = string.Empty; // ntext

        [StringLength(50)]
        public string Status { get; set; } = "Open";

        public int? CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual Employee? Creator { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
