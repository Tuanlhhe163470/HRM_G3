using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Recruitment
{
    public class ScheduleInterviewDto
    {
        public int InterviewID { get; set; } // Thêm ID để dễ quản lý
        public int CandidateID { get; set; }
        public DateTime InterviewDate { get; set; }
        public string? InterviewType { get; set; }
        public string? Location { get; set; }
        public int? InterviewerID { get; set; }
        public string? Note { get; set; }

        // Bổ sung các trường hiển thị
        public string? CandidateName { get; set; }
        public string? CandidatePhone { get; set; }
        public string? JobTitle { get; set; }
    }
}
