using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.TimeAttendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExplanationsController : ControllerBase
    {
        private readonly IAttendanceExplanationService _explanationService;

        public ExplanationsController(IAttendanceExplanationService explanationService)
        {
            _explanationService = explanationService;
        }

        private int GetCurrentEmployeeId()
        {
            var userIdClaim = User.FindFirst("EmployeeID") ?? User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int employeeId))
            {
                throw new UnauthorizedAccessException("Token không hợp lệ hoặc không tìm thấy ID nhân viên.");
            }
            return employeeId;
        }

        // 1. POST: api/explanations (Nhân viên nộp đơn)
        [HttpPost]
        public async Task<IActionResult> SubmitExplanation([FromBody] SubmitExplanationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                int employeeId = GetCurrentEmployeeId();
                var result = await _explanationService.SubmitExplanationAsync(employeeId, request);

                return Ok(new
                {
                    Message = "Nộp đơn giải trình thành công! Đang chờ Quản lý phê duyệt.",
                    Data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống.", Details = ex.Message });
            }
        }

        // 2. GET: api/explanations/my-requests (Lấy danh sách đơn của mình)
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyExplanations()
        {
            try
            {
                int employeeId = GetCurrentEmployeeId();
                var results = await _explanationService.GetMyExplanationsAsync(employeeId);

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống.", Details = ex.Message });
            }
        }

        // 3. GET: api/explanations/{id} (Xem chi tiết 1 đơn cụ thể)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExplanationById(int id)
        {
            try
            {
                var result = await _explanationService.GetByIdAsync(id);

                int currentEmpId = GetCurrentEmployeeId();
                if (result.EmployeeId != currentEmpId)
                {
                    return Forbid("Bạn không có quyền xem đơn giải trình của người khác.");
                }

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống.", Details = ex.Message });
            }
        }
        // PUT: api/explanations/{id}/review
        [HttpPut("{id}/review")]
        public async Task<IActionResult> ReviewExplanation(int id, [FromBody] ReviewExplanationRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                int reviewerId = GetCurrentEmployeeId();

                var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
                string role = roleClaim?.Value ?? "Employee";

                // Chỉ Manager hoặc HR mới được gọi API này
                if (role != "Manager" && role != "HR")
                {
                    return StatusCode(403, new { Message = "Chỉ Quản lý hoặc HR mới có quyền phê duyệt đơn." });
                }

                var result = await _explanationService.ReviewExplanationAsync(id, reviewerId, role, request);

                string action = request.IsApproved ? "Phê duyệt" : "Từ chối";
                return Ok(new { Message = $"Đã {action} đơn giải trình thành công!", Data = result });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { Message = "Lỗi hệ thống.", Details = ex.Message }); }
        }

        // GET: api/explanations/pending
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingExplanations()
        {
            try
            {
                int reviewerId = GetCurrentEmployeeId();

                var roleClaim = User.FindFirst("role") ?? User.FindFirst(ClaimTypes.Role);
                string role = roleClaim?.Value ?? "Employee";

                if (role != "Manager" && role != "HR")
                {
                    return StatusCode(403, new { Message = "Chỉ Quản lý hoặc HR mới có quyền xem danh sách chờ duyệt." });
                }

                var results = await _explanationService.GetPendingExplanationsAsync(reviewerId, role);

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống.", Details = ex.Message });
            }
        }
    }
}