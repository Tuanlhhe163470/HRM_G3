namespace HRM_Application.DTOs.Positions
{
    public class PositionResponse
    {
        public int PositionID { get; set; }
        public string PositionName { get; set; } = string.Empty;
        public decimal? BaseSalaryRange { get; set; }
    }
}