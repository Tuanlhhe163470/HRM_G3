using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Recruitment
{
    public class CandidateDto
    {
        public int CandidateID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string CVUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty; 
        public DateTime CreatedAt { get; set; }
        public string DepartmentName { get; set; } 
        public int? DepartmentID { get; set; }    
        public int? Score { get; set; }     
        public string? Comments { get; set; }
        public bool IsFailEmailSent { get; set; }
    }
}
