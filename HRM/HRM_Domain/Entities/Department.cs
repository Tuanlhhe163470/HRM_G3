using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Department
    {
        [Key]
        public int DepartmentID { get; set; }

        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        public int? ManagerID { get; set; } // Link to Employee later via FluentAPI to avoid cycle

        [StringLength(20)]
        public string? Phone { get; set; }
    }
}
