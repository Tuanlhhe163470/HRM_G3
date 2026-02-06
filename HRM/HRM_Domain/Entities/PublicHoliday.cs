using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class PublicHoliday
    {
        [Key]
        public int HolidayID { get; set; }

        public string HolidayName { get; set; }

        [StringLength(100)]
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public DateTime Date { get; set; }
        public int Year { get; set; }
        public bool IsRecurring { get; set; }
    }
}
