using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class SalaryAdvanceController : ControllerBase
    {
        private readonly ISalaryAdvanceService _advanceService;

        public SalaryAdvanceController(ISalaryAdvanceService advanceService)
        {
            _advanceService = advanceService;
        }

        // Gửi yêu cầu ứng lương
        [HttpPost("request")]
        public async Task<IActionResult> RequestAdvance([FromBody] CreateSalaryAdvanceDTO request)
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int employeeId))
                return Unauthorized(new { message = "Không xác định được danh tính nhân viên." });

            try
            {
                var success = await _advanceService.RequestAdvanceAsync(employeeId, request);

                if (success)
                    return Ok(new { message = "Đã gửi yêu cầu ứng lương thành công. Vui lòng chờ HR phê duyệt." });

                return BadRequest(new { message = "Lỗi khi xử lý yêu cầu." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý yêu cầu ứng lương." });
            }
        }

        // Xem lịch sử ứng lương 
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyHistory()
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int employeeId))
                return Unauthorized();

            var data = await _advanceService.GetMyAdvanceHistoryAsync(employeeId);
            return Ok(data);
        }

        // Quản lý xem danh sách đơn đang chờ duyệt

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int userId))
                return Unauthorized();

            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

            var data = await _advanceService.GetPendingRequestsAsync(userId, userRole);
            return Ok(data);
        }

        // Xem toàn bộ lịch sử đơn ứng lương 
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRequests()
        {
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int userId))
                return Unauthorized();

            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

            var data = await _advanceService.GetAllAdvancesAsync(userId, userRole);
            return Ok(data);
        }

        // Quản lý Duyệt / Từ chối đơn
        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessRequest(int id, [FromBody] ProcessAdvanceRequestDTO request)
        {
            // Lấy ID người duyệt từ Token
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int managerId))
                return Unauthorized(new { message = "Không xác định được danh tính Quản lý." });

            if (!request.IsApproved && string.IsNullOrWhiteSpace(request.ManagerNote))
            {
                return BadRequest(new { message = "Bạn bắt buộc phải nhập lý do khi từ chối đơn ứng lương!" });
            }

            var success = await _advanceService.ProcessAdvanceRequestAsync(id, request, managerId);

            if (success)
                return Ok(new { message = request.IsApproved ? "Đã duyệt đơn thành công." : "Đã từ chối đơn ứng lương." });

            return BadRequest(new { message = "Không thể xử lý. Đơn này có thể không tồn tại hoặc đã được xử lý trước đó." });
        }
    }
}