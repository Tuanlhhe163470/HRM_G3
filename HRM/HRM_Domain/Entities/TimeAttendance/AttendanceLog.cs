using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities.TimeAttendance
{
    public class AttendanceLog
    {
        [Key]
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int ShiftId { get; set; }
        [ForeignKey("ShiftId")]
        public ShiftConfig? ShiftConfig { get; set; }
        public DateTime WorkDate { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        [MaxLength(50)]
        public string? CheckInIp { get; set; }
        [MaxLength(50)]
        public string? CheckOutIp { get; set; }
        public double? WorkingHours { get; set; } = 0;

        public int LateMinutes { get; set; } = 0;
        public int EarlyLeaveMinutes { get; set; } = 0;
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Absent;
        public string? Note { get; set; }
        public bool IsSystemGenerated { get; set; } = false;
    }
}
