using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using HRM_Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;

namespace HRM_API.Controllers
{
    [Route("api/reports")]
    [ApiController]
    // [Authorize(Roles = "Admin,Manager,HR")] // Bỏ comment dòng này nếu bạn dùng JWT Authentication
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("insurance")]
        public async Task<IActionResult> GetInsuranceReport([FromQuery] int month, [FromQuery] int year)
        {
            var data = await _reportService.GetInsuranceReportAsync(month, year);
            return Ok(new { data });
        }

        [HttpGet("tax")]
        public async Task<IActionResult> GetTaxReport([FromQuery] int month, [FromQuery] int year)
        {
            var data = await _reportService.GetTaxReportAsync(month, year);
            return Ok(new { data });
        }
    }
}