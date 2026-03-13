using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Employee
{
    public class CreateEmployeeRequest
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? AvatarURL { get; set; }

        public int? DepartmentID { get; set; }
        public int? PositionID { get; set; }
        public int? ManagerID { get; set; }

        public DateTime? JoinDate { get; set; }
        public string Status { get; set; } = "Working";
    }
}
