using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM_Domain.Entities
{
    [Table("PublicHolidays")]
    public class PublicHoliday
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string HolidayName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsRecurring { get; set; } = false;
    }
}