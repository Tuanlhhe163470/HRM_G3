using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.TimeAttendance;
using HRM_Application.Services.TimeAttendance;
//using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        // --- 1. API CHECK-IN ---
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (string.IsNullOrEmpty(request.CheckInIp))
                {
                    request.CheckInIp = GetClientIpAddress();
                }

                var result = await _attendanceService.CheckInAsync(userId, request);

                return Ok(new { message = "Check-in thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // --- 2. API CHECK-OUT ---
        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (string.IsNullOrEmpty(request.CheckOutIp))
                {
                    request.CheckOutIp = GetClientIpAddress();
                }

                var result = await _attendanceService.CheckOutAsync(userId, request);

                return Ok(new { message = "Check-out thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // --- 3. API LỊCH SỬ CÁ NHÂN ---
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyHistory([FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = GetCurrentUserId();

            int m = month ?? DateTime.Now.Month;
            int y = year ?? DateTime.Now.Year;

            var logs = await _attendanceService.GetMyAttendanceLogsAsync(userId, m, y);

            return Ok(new { data = logs });
        }

        // --- HELPER METHODS (Private) ---

        private int GetCurrentUserId()
        {
            if (Request.Headers.TryGetValue("x-test-user-id", out var headerId))
            {
                if (int.TryParse(headerId, out int id)) return id;
            }

            return 1;
        }

        // Hàm lấy IP Address
        private string GetClientIpAddress()
        {
            return "127.0.0.1";
        }
    }
}