using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Employee
    {
        [Key]
        public int EmployeeID { get; set; }

        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }

        [StringLength(15)]
        public string? Phone { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        [StringLength(500)]
        public string? AvatarURL { get; set; }

        // Foreign Keys
        public int? DepartmentID { get; set; }
        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }

        public int? PositionID { get; set; }
        [ForeignKey("PositionID")]
        public virtual Position? Position { get; set; }

        public int? ManagerID { get; set; }
        [ForeignKey("ManagerID")]
        public virtual Employee? Manager { get; set; } // Self-join

        public DateTime? JoinDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Working"; // Working, Resigned...
    }
}
