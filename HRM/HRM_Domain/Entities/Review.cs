using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Review
    {
        [Key]
        public int ReviewID { get; set; }

        public int CycleID { get; set; }
        [ForeignKey("CycleID")]
        public virtual ReviewCycle? ReviewCycle { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int? ManagerID { get; set; }
        [ForeignKey("ManagerID")]
        public virtual Employee? Manager { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "NotStarted";

        [Column(TypeName = "decimal(5,2)")]
        public decimal? FinalScore { get; set; }

        [StringLength(10)]
        public string? Rank { get; set; }

        [StringLength(1000)]
        public string? GeneralComment { get; set; }
        public DateTime? FinalizedAt { get; set; }
    }
}
