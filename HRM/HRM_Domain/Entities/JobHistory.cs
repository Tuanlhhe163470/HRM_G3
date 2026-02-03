using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class JobHistory
    {
        [Key]
        public int JobHistoryID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int? OldDepartmentID { get; set; }
        public int? NewDepartmentID { get; set; }

        public int? OldPositionID { get; set; }
        public int? NewPositionID { get; set; }

        public DateTime ChangeDate { get; set; }

        [StringLength(200)]
        public string? Reason { get; set; }
    }
}
