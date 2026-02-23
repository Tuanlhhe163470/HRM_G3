using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.PublicHoliday.Requests
{
    public class UpdatePublicHolidayRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string HolidayName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsRecurring { get; set; }
    }
}