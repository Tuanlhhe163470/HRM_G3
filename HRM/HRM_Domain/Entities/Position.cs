using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Position
    {
        [Key]
        public int PositionID { get; set; }

        [StringLength(100)]
        public string PositionName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BaseSalaryRange { get; set; }
    }
}
