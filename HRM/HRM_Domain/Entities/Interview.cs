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

        public int ApplicationID { get; set; }
        [ForeignKey("ApplicationID")]
        public virtual Application? Application { get; set; }

        public DateTime InterviewDate { get; set; }

        [StringLength(100)]
        public string? InterviewType { get; set; }

        public int? InterviewerID { get; set; }
        [ForeignKey("InterviewerID")]
        public virtual Employee? Interviewer { get; set; }

        [StringLength(50)]
        public string? Result { get; set; }
    }
}
