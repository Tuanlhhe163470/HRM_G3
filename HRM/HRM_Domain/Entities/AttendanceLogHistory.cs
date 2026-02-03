using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class AttendanceLogHistory
    {
        [Key]
        public long HistoryID { get; set; }

        public int LogID { get; set; }
        [ForeignKey("LogID")]
        public virtual AttendanceLog? AttendanceLog { get; set; }

        public int? ModifiedBy { get; set; }
        [ForeignKey("ModifiedBy")]
        public virtual UserAccount? Modifier { get; set; }

        [StringLength(20)]
        public string? OldStatus { get; set; }
        [StringLength(20)]
        public string? NewStatus { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }
        public DateTime ModifiedDate { get; set; } = DateTime.Now;
    }
}
