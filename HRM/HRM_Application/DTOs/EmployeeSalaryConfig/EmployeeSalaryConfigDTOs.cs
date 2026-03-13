using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.EmployeeSalaryConfig
{
    public class EmployeeSalaryConfigDTO
    {
        public int ConfigID { get; set; }
        public int EmployeeID { get; set; }
        public int ComponentID { get; set; }
        public string ComponentName { get; set; } = string.Empty; // Tên lấy từ bảng SalaryComponent
        public string Type { get; set; } = string.Empty;          // Income/Deduction
        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; }
        public bool IsActive { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
    }

    // DTO để nhận dữ liệu từ Client gửi lên (Thêm/Sửa)
    public class AssignSalaryConfigDTO
    {
        public int EmployeeID { get; set; }
        public int ComponentID { get; set; }
        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; } = DateTime.Now;
    }
    public class EmployeeDTO
    {
        public int EmployeeID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
