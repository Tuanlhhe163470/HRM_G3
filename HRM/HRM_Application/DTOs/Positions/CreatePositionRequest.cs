namespace HRM_Application.DTOs.Positions
{
    public class CreatePositionRequest
    {
        public string PositionName { get; set; } = string.Empty;
        public decimal? BaseSalaryRange { get; set; }
    }
}