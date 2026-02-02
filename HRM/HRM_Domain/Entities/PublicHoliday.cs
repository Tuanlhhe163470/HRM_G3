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

        [StringLength(100)]
        public string HolidayName { get; set; } = string.Empty;

        public DateTime Date { get; set; }
        public int Year { get; set; }
        public bool IsRecurring { get; set; }
    }
}
