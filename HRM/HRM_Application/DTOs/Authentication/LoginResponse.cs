using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Authentication
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public EmployeeLoginDto Employee { get; set; } = new();
    }

    public class EmployeeLoginDto
    {
        public int EmployeeID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public int? DepartmentID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? AvatarURL { get; set; }
        public string? DepartmentName { get; set; }
        public string? PositionName { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
