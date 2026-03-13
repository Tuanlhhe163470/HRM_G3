namespace HRM_Application.DTOs.PublicHoliday.Responses
{
    public class PublicHolidayResponse
    {
        public int Id { get; set; }
        public string HolidayName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int DurationDays => (EndDate - StartDate).Days + 1;

        public bool IsRecurring { get; set; }
    }
}