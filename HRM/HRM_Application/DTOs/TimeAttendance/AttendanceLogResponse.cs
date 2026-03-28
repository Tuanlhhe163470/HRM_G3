using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class AttendanceLogResponse
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;

        public string ShiftName { get; set; } = string.Empty;
        public DateTime WorkDate { get; set; }

        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        public double WorkingHours { get; set; }
        public double OvertimeHours { get; set; }
        public string Status { get; set; }
        public string? Note { get; set; }
    }
}
