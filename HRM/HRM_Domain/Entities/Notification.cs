using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class Notification
    {
        [Key]
        public long NotificationID { get; set; }

        public int UserID { get; set; }
        [ForeignKey("UserID")]
        public virtual UserAccount? User { get; set; }

        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string Message { get; set; } = string.Empty;

        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // Info, Warning...

        [StringLength(255)]
        public string? TargetUrl { get; set; }

        public bool IsRead { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
