using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Authentication
{
    public class AccountResponseDto
    {
        public int AccountID { get; set; }
        public int? EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string Username { get; set; }
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
