using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Shift.Responses
{
    public class ShiftResponse
    {
        public int Id { get; set; }
        public string ShiftName { get; set; }
        public string MorningStart { get; set; } // Trả về dạng "08:00"
        public string AfternoonEnd { get; set; }
        public int AllowedLateMinutes { get; set; }
        public bool IsActive { get; set; }
    }
}
