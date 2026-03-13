using System;
using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.LaborContract
{
    public class CreateLaborContractRequest
    {
        [Required(ErrorMessage = "Vui lòng chọn Nhân viên")]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Loại hợp đồng không được để trống")]
        [MaxLength(50)]
        public string ContractType { get; set; } = string.Empty;

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Lương cơ bản phải lớn hơn hoặc bằng 0")]
        public decimal BaseSalary { get; set; }

        // Mặc định khi tạo mới thường là Active
        public bool IsActive { get; set; } = true;

        public DateTime? SignedDate { get; set; }
    }
}