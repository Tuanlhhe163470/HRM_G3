using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities.TimeAttendance
{
    public class ShiftConfig
    {
        [Key]
        public int Id { get; set; }
        public string ShiftName { get; set; } = string.Empty;

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public TimeSpan? BreakStartTime { get; set; } // Nghỉ trưa từ (VD: 12:00)
        public TimeSpan? BreakEndTime { get; set; }   // Đến (VD: 13:30)

        public int AllowedLateMinutes { get; set; } = 0;   // Cho phép đi muộn
        public int AllowedEarlyLeaveMinutes { get; set; } = 0; // Cho phép về sớm
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [MaxLength(20)]
        public string WorkDays { get; set; } = "1,2,3,4,5";
    }
}
