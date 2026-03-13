using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            await _payrollService.CalculateMonthlyPayrollAsync(request.Month, request.Year);
            return Ok(new { success = true, message = "Tính lương hoàn tất!" });
        }

        [HttpGet("Monthly")]
        public async Task<IActionResult> GetMonthly([FromQuery] int month, [FromQuery] int year)
        {
            var data = await _payrollService.GetPayrollByMonthAsync(month, year);
            return Ok(data);
        }

        [Authorize(Roles = "HR,Admin,Manager")]
        [HttpPut("{id}/adjust")]
        public async Task<IActionResult> Adjust(int id, [FromBody] AdjustPayrollRequest request)
        {
            await _payrollService.AdjustPayrollAsync(id, request.Amount, request.Reason ?? string.Empty);
            return Ok(new { message = "Điều chỉnh bảng lương thành công" });
        }

        [Authorize(Roles = "HR,Admin,Manager")]
        [HttpPost("{id}/adjust/add")]
        public async Task<IActionResult> AddAdjustment(int id, [FromBody] AdjustPayrollRequest request)
        {
            await _payrollService.AddAdjustmentAsync(id, request.Amount, request.Reason ?? string.Empty);
            return Ok(new { message = "Đã thêm điều chỉnh thành công" });
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApprovalRequest request)
        {
            var managerId = request.ManagerId;
            await _payrollService.ApprovePayrollAsync(id, managerId, request.IsApproved);
            return Ok(new { message = request.IsApproved ? "Đã duyệt" : "Đã từ chối" });
        }

        //[Authorize]
        [HttpGet("my-salary")]
        public async Task<IActionResult> GetMySalary([FromQuery] int month, [FromQuery] int year)
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId)) return Unauthorized(new { message = "Không xác thực được danh tính." });

            if (!int.TryParse(claimId, out int employeeId))
                return BadRequest(new { message = "Định dạng ID không hợp lệ." });

            var data = await _payrollService.GetPersonalPayrollAsync(employeeId, month, year);

            if (data == null)
                return NotFound(new { message = "Bảng lương chưa được công bố hoặc không tồn tại." });

            return Ok(data);
        }
    }

    public class PayrollRequest { public int Month { get; set; } public int Year { get; set; } }

    public class AdjustPayrollRequest
    {
        public decimal Amount { get; set; }
        public string? Reason { get; set; }
    }

    public class ApprovalRequest
    {
        public bool IsApproved { get; set; }
        public int ManagerId { get; set; }
    }
}