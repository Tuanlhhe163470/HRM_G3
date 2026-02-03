using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class EmployeeSalaryDetail
    {
        [Key]
        public int DetailID { get; set; }

        public int PayrollID { get; set; }
        [ForeignKey("PayrollID")]
        public virtual MonthlyPayroll? MonthlyPayroll { get; set; }

        public int ComponentID { get; set; }
        [ForeignKey("ComponentID")]
        public virtual SalaryComponent? SalaryComponent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
    }
}
