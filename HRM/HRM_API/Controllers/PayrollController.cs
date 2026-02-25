using HRM_Application.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly IPayrollService _payrollService;

        public PayrollController(IPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpPost("Calculate")]
        public async Task<IActionResult> Calculate([FromBody] PayrollRequest request)
        {
            var result = await _payrollService.CalculateMonthlyPayrollAsync(request.Month, request.Year);
            return Ok(new { message = "Tính lương hoàn tất!" });
        }

        [HttpGet("Monthly")]
        public async Task<IActionResult> GetMonthly(int month, int year)
        {
            var result = await _payrollService.GetPayrollByMonthAsync(month, year);
            return Ok(result);
        }
    }

    public class PayrollRequest { public int Month { get; set; } public int Year { get; set; } }
}