using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class PerformanceGoal
    {
        [Key]
        public int GoalID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int CycleID { get; set; }
        [ForeignKey("CycleID")]
        public virtual ReviewCycle? ReviewCycle { get; set; }

        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public int Weight { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Draft";

        [StringLength(500)]
        public string? ManagerComment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
