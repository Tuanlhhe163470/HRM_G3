using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.Department.Requests
{
    public class CreateDepartmentRequest
    {
        [Required(ErrorMessage = "Tên phòng ban không được để trống")]
        [MaxLength(100, ErrorMessage = "Tên phòng ban không quá 100 ký tự")]
        public string DepartmentName { get; set; } = string.Empty;

        public int? ManagerID { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }
}