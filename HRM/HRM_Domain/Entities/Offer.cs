using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Offer
    {
        [Key]
        public int OfferID { get; set; }

        public int CandidateID { get; set; }
        [ForeignKey("CandidateID")]
        public virtual Candidate? Candidate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OfferedSalary { get; set; }

        public DateTime JoinDate { get; set; }

        public string? Note { get; set; }

        [StringLength(50)]
        public string OfferStatus { get; set; } = "Pending"; 

        public DateTime OfferedDate { get; set; } = DateTime.Now;
        public DateTime? ResponseDate { get; set; }

        public virtual ICollection<OfferAllowance> OfferAllowances { get; set; } = new List<OfferAllowance>();
    }

    public class OfferAllowance
    {
        [Key]
        public int Id { get; set; }
        public int OfferID { get; set; }
        public int ComponentID { get; set; }

        [ForeignKey("OfferID")]
        public virtual Offer Offer { get; set; }

        [ForeignKey("ComponentID")]
        public virtual SalaryComponent SalaryComponent { get; set; }
    }
}
