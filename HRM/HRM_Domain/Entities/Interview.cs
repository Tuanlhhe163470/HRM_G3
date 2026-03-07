using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Interview
    {
        [Key]
        public int InterviewID { get; set; }

        public int CandidateID { get; set; }

        [ForeignKey("CandidateID")]
        public virtual Candidate? Candidate { get; set; }

        public DateTime InterviewDate { get; set; }

        [StringLength(100)]
        public string? InterviewType { get; set; }
        public string? Location { get; set; }
        public int? InterviewerID { get; set; }
        [ForeignKey("InterviewerID")]
        public virtual Employee? Interviewer { get; set; }
        public int? Score { get; set; } // Lưu điểm từ 1-10
        public string? Comments { get; set; } // Lưu nhận xét của Manager
        [StringLength(50)]
        public string? Result { get; set; }
    }
}
