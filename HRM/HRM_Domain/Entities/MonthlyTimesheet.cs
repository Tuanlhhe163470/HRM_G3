using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class MonthlyTimesheet
    {
        [Key]
        public int TimesheetID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        [Column(TypeName = "decimal(4,1)")]
        public decimal TotalWorkDays { get; set; }

        public int TotalLateMinutes { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Calculation_Pending";

        public DateTime? LastCalculatedDate { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? LockedDate { get; set; }
    }
}
