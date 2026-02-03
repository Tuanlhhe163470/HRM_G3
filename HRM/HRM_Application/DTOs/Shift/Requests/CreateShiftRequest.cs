using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Shift.Requests
{
    public class CreateShiftRequest
    {
        public string ShiftName { get; set; }
        public string MorningStart { get; set; }
        public string AfternoonEnd { get; set; }
        public int AllowedLateMinutes { get; set; }
    }
}
