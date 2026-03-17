using System.ComponentModel.DataAnnotations;

namespace HRM_Application.DTOs.PublicHoliday.Requests
{
    public class CreatePublicHolidayRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Tên ngày lễ là bắt buộc")]
        public string HolidayName { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsRecurring { get; set; } = false;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EndDate.Date < StartDate.Date)
            {
                yield return new ValidationResult(
                    "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.",
                    new[] { nameof(EndDate) } // Chỉ định rõ lỗi nằm ở trường EndDate cho Frontend biết
                );
            }
        }
    }
}