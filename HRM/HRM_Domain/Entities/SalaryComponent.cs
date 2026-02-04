using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class SalaryComponent
    {
        [Key]
        public int ComponentID { get; set; }

        [StringLength(100)]
        public string ComponentName { get; set; } = string.Empty;

        [StringLength(10)]
        public string Type { get; set; } = "Income"; // Income, Deduction

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public bool IsFixed { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
