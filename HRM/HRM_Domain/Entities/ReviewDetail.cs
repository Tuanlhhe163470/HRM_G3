using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class ReviewDetail
    {
        [Key]
        public long DetailID { get; set; }

        public long ReviewID { get; set; }
        [ForeignKey("ReviewID")]
        public virtual Review? Review { get; set; }

        public long GoalID { get; set; }
        [ForeignKey("GoalID")]
        public virtual PerformanceGoal? PerformanceGoal { get; set; }

        public int? SelfScore { get; set; }
        [StringLength(500)]
        public string? SelfComment { get; set; }

        public int? ManagerScore { get; set; }
        [StringLength(500)]
        public string? ManagerComment { get; set; }
    }
}
