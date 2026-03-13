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
        public string JobTitle { get; set; } = string.Empty; // Hiển thị tên vị trí
        public DateTime CreatedAt { get; set; }
        public string DepartmentName { get; set; } // Thêm trường này
        public int? DepartmentID { get; set; }    // Thêm trường này để lọc
    }
}
