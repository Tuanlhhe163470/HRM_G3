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
            try
            {
                await _payrollService.CalculateMonthlyPayrollAsync(request.Month, request.Year);
                return Ok(new { success = true, message = "Tính lương hoàn tất!" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Monthly")]
        public async Task<IActionResult> GetMonthly([FromQuery] int month, [FromQuery] int year)
        {
            int userId = GetUserId();
            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

            var data = await _payrollService.GetPayrollByMonthAsync(month, year, userId, userRole);
            return Ok(data);
        }

        [Authorize(Roles = "HR,Admin,Manager")]
        [HttpPut("{id}/adjust")]
        public async Task<IActionResult> Adjust(int id, [FromBody] AdjustPayrollRequest request)
        {
            try
            {
                var managerId = GetUserId();
                await _payrollService.AdjustPayrollAsync(id, request.Amount, request.Reason ?? string.Empty, managerId);
                return Ok(new { message = "Điều chỉnh bảng lương thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "HR,Admin,Manager")]
        [HttpPost("{id}/adjust/add")]
        public async Task<IActionResult> AddAdjustment(int id, [FromBody] AdjustPayrollRequest request)
        {
            try
            {
                var managerId = GetUserId();
                await _payrollService.AddAdjustmentAsync(id, request.Amount, request.Reason ?? string.Empty, managerId);
                return Ok(new { message = "Đã thêm điều chỉnh thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApprovalRequest request)
        {
            try
            {
                var managerId = request.ManagerId > 0 ? request.ManagerId : GetUserId();
                await _payrollService.ApprovePayrollAsync(id, managerId, request.IsApproved);
                return Ok(new { message = request.IsApproved ? "Đã duyệt" : "Đã từ chối" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        //[Authorize]
        [HttpGet("my-salary")]
        public async Task<IActionResult> GetMySalary([FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                int employeeId = GetUserId();
                var data = await _payrollService.GetPersonalPayrollAsync(employeeId, month, year);

                if (data == null)
                    return NotFound(new { message = "Bảng lương chưa được công bố hoặc không tồn tại." });

                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        private int GetUserId()
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (int.TryParse(claimId, out int employeeId))
            {
                return employeeId;
            }
            throw new UnauthorizedAccessException("Không xác thực được danh tính.");
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