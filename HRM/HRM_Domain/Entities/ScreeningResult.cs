using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class ScreeningResult
    {
        [Key]
        public int ScreeningID { get; set; }

        public int ApplicationID { get; set; }
        [ForeignKey("ApplicationID")]
        public virtual Application? Application { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? Score { get; set; }

        public string? MatchedSkills { get; set; }

        [StringLength(50)]
        public string? ResultSuggest { get; set; }
        public DateTime ScreenedAt { get; set; } = DateTime.Now;
    }
}
