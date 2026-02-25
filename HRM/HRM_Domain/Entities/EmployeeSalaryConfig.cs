using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class EmployeeSalaryConfig
    {
        [Key]
        public int ConfigID { get; set; }

        // Khóa ngoại nối thẳng tới Nhân viên
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        // Khóa ngoại nối tới Khoản lương (Base Salary, Allowance...)
        public int ComponentID { get; set; }
        [ForeignKey("ComponentID")]
        public virtual SalaryComponent? SalaryComponent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } // Mức tiền thỏa thuận (VD: 10.000.000 đ)

        public DateTime EffectiveDate { get; set; } = DateTime.Now; // Ngày bắt đầu áp dụng mức lương này

        public bool IsActive { get; set; } = true; // Trạng thái (Đang áp dụng)
    }
}