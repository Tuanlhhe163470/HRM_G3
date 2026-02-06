using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PayRoll
{
    public class SalaryComponentDTO
    {
        public int ComponentID { get; set; }
        public string ComponentName { get; set; }
        public string Type { get; set; }
        public decimal Amount { get; set; }
        public bool IsFixed { get; set; }
        public bool IsActive { get; set; }
    }

    // DTO dùng để tạo mới (Create)
    public class CreateSalaryComponentDTO
    {
        [Required(ErrorMessage = "Tên khoản lương không được để trống")]
        public string ComponentName { get; set; }

        [Required]
        [RegularExpression("Income|Deduction", ErrorMessage = "Loại phải là 'Income' hoặc 'Deduction'")]
        public string Type { get; set; } // Income, Deduction

        public decimal Amount { get; set; }
        public bool IsFixed { get; set; }
    }

    // DTO dùng để cập nhật (Update)
    public class UpdateSalaryComponentDTO : CreateSalaryComponentDTO
    {
        public bool IsActive { get; set; }
    }
}
