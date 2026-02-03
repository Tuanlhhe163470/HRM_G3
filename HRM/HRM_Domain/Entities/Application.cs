using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Application
    {
        [Key]
        public int ApplicationID { get; set; }

        public int CandidateID { get; set; }
        [ForeignKey("CandidateID")]
        public virtual Candidate? Candidate { get; set; }

        public int JobID { get; set; }
        [ForeignKey("JobID")]
        public virtual JobPosting? JobPosting { get; set; }

        [StringLength(100)]
        public string CurrentStage { get; set; } = "Applied";

        public DateTime AppliedDate { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string? FinalStatus { get; set; }
    }   
}
