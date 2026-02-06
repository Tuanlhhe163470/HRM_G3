using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PublicHoliday.Responses
{
    public class PublicHolidayResponse
    {
        public int HolidayID { get; set; }

        public string HolidayName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Year { get; set; }
        public bool IsRecurring { get; set; }
    }
}
