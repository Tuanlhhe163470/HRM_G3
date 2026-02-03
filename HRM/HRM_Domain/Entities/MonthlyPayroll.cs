using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class MonthlyPayroll
    {
        [Key]
        public long PayrollID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public long TimesheetID { get; set; }
        [ForeignKey("TimesheetID")]
        public virtual MonthlyTimesheet? Timesheet { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseSalary { get; set; }

        public int StandardWorkDays { get; set; }

        [Column(TypeName = "decimal(4,1)")]
        public decimal ActualWorkDays { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SalaryPerDay { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAllowance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalDeduction { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FinalNetSalary { get; set; }

        public DateTime? PaymentDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Draft";
    }
}
