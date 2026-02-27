using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HRM_Application.Interfaces.Services;
using HRM_Application.DTOs.Leave;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeavesController : ControllerBase
    {
        private readonly ILeaveService _leaveService;

        public LeavesController(ILeaveService leaveService)
        {
            _leaveService = leaveService;
        }

        [HttpGet("my-balances")]
        public async Task<IActionResult> GetMyBalances([FromQuery] int year)
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int employeeId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng." });
            }

            var balances = await _leaveService.GetMyBalancesAsync(employeeId, year);

            return Ok(balances);
        }

        [HttpGet("types")]
        public async Task<IActionResult> GetLeaveTypes()
        {
            var types = await _leaveService.GetLeaveTypesAsync();
            return Ok(types);
        }

        [HttpPost("request")]
        public async Task<IActionResult> SubmitLeaveRequest([FromBody] CreateLeaveRequestDto dto)
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int employeeId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính." });
            }

            try
            {
                var result = await _leaveService.SubmitLeaveRequestAsync(employeeId, dto);
                return Ok(new { Message = "Nộp đơn xin nghỉ phép thành công!", Data = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi nộp đơn." });
            }
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyLeaveRequests()
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int employeeId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính." });
            }

            var result = await _leaveService.GetMyLeaveRequestsAsync(employeeId);
            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
            string role = roleClaim?.Value ?? "Manager";

            var pendingList = await _leaveService.GetPendingLeaveRequestsAsync(role);
            return Ok(pendingList);
        }

        [HttpPut("{id}/review")]
        public async Task<IActionResult> ReviewRequest(int id, [FromBody] ReviewLeaveRequestDto dto)
        {
            var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
            string role = roleClaim?.Value ?? "Manager";
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;

            if (!int.TryParse(userIdClaim, out int reviewerId)) return Unauthorized();

            try
            {
                await _leaveService.ReviewLeaveRequestAsync(id, role, reviewerId, dto);
                return Ok(new { Message = "Đã xử lý đơn thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}