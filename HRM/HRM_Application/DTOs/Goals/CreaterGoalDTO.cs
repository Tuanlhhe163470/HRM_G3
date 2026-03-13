using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Goals
{
    public class CreateGoalDTO
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Weight { get; set; }
        public int? CycleID { get; set; }
        public int? EmployeeID { get; set; }
    }
}
