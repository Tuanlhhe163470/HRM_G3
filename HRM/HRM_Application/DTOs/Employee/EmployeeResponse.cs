using HRM_Application.DTOs.Commons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Employee
{
    public class EmployeeResponse
    {
        public int EmployeeID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? AvatarURL { get; set; }

        public BaseReferenceResponse? Department { get; set; }
        public BaseReferenceResponse? Position { get; set; }
        public BaseReferenceResponse? Manager { get; set; }

        public DateTime? JoinDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
