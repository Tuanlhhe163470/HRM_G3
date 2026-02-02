using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Candidate
    {
        [Key]
        public int CandidateID { get; set; }

        [Required]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Phone { get; set; }

        [Required]
        public string CVUrl { get; set; } = string.Empty; // text mapped to string

        [StringLength(100)]
        public string? Source { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
