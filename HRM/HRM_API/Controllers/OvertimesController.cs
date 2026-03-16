using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Overtime;
using System.Security.Claims;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OvertimesController : ControllerBase
    {
        private readonly IOvertimeService _overtimeService;

        public OvertimesController(IOvertimeService overtimeService)
        {
            _overtimeService = overtimeService;
        }

        [HttpPost("request")]
        public async Task<IActionResult> SubmitOvertimeRequest([FromBody] CreateOvertimeRequestDto dto)
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int employeeId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng." });
            }

            try
            {
                await _overtimeService.SubmitRequestAsync(employeeId, dto);
                return Ok(new { Message = "Nộp đơn xin làm thêm giờ thành công! Đã gửi cho Quản lý." });
            }
            catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi nộp đơn." }); }
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyOvertimeRequests()
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int employeeId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính." });
            }

            var result = await _overtimeService.GetMyRequestsAsync(employeeId);
            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
            string role = roleClaim?.Value ?? "Manager";

            var pendingList = await _overtimeService.GetPendingRequestsAsync(role);
            return Ok(pendingList);
        }

        [HttpPut("{id}/review")]
        public async Task<IActionResult> ReviewRequest(int id, [FromBody] ReviewOvertimeDto dto)
        {
            var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
            string role = roleClaim?.Value ?? "Manager";

            var userIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(userIdClaim, out int reviewerId))
            {
                return Unauthorized(new { Message = "Không xác định được danh tính người duyệt." });
            }

            try
            {
                await _overtimeService.ReviewRequestAsync(id, role, reviewerId, dto);
                var action = dto.IsApproved ? "Duyệt" : "Từ chối";
                return Ok(new { Message = $"Đã {action} đơn làm thêm giờ thành công." });
            }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, new { Message = ex.Message }); } 
            catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { Message = "Lỗi hệ thống: " + ex.Message }); }
        }
    }
}