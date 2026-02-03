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

        public int ApplicationID { get; set; }
        [ForeignKey("ApplicationID")]
        public virtual Application? Application { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OfferedSalary { get; set; }

        [StringLength(50)]
        public string OfferStatus { get; set; } = "Pending";

        public DateTime OfferedDate { get; set; } = DateTime.Now;
        public DateTime? ResponseDate { get; set; }
    }
}
