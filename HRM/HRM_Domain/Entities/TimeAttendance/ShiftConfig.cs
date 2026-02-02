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

        public TimeSpan MorningStart { get; set; }
        public TimeSpan AfternoonEnd { get; set; }

        public int AllowedLateMinutes { get; set; } // Số phút cho phép đi muộn (VD: 15)

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
