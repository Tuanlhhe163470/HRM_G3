using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class MyTimesheetSummaryResponse
    {
        public double ActualWorkingHours { get; set; }
        public double PaidLeaveHours { get; set; }

        public int LateCount { get; set; }
        public int TotalLateMinutes { get; set; }

        public int EarlyLeaveCount { get; set; }
        public int TotalEarlyLeaveMinutes { get; set; }

        public int MissingCheckOutCount { get; set; }
        public int AbsentCount { get; set; }
        public int OnLeaveCount { get; set; }

        public List<AttendanceLogResponse> Logs { get; set; } = new List<AttendanceLogResponse>();
    }
}
