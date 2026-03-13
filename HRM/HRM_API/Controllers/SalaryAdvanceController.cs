using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc phải đăng nhập mới được ứng lương
    public class SalaryAdvanceController : ControllerBase
    {
        private readonly ISalaryAdvanceService _advanceService;

        public SalaryAdvanceController(ISalaryAdvanceService advanceService)
        {
            _advanceService = advanceService;
        }

        // 1. API Gửi yêu cầu ứng lương
        [HttpPost("request")]
        public async Task<IActionResult> RequestAdvance([FromBody] CreateSalaryAdvanceDTO request)
        {
            // Bóc EmployeeID từ Token y như chức năng xem lương
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int employeeId))
                return Unauthorized(new { message = "Không xác định được danh tính nhân viên." });

            if (request.Amount <= 0)
                return BadRequest(new { message = "Số tiền ứng phải lớn hơn 0." });

            var success = await _advanceService.RequestAdvanceAsync(employeeId, request);

            if (success)
                return Ok(new { message = "Đã gửi yêu cầu ứng lương thành công. Vui lòng chờ HR phê duyệt." });

            return BadRequest(new { message = "Lỗi khi xử lý yêu cầu." });
        }

        // 2. API Xem lịch sử ứng lương của bản thân
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

        // 3. API Quản lý xem danh sách đơn đang chờ duyệt
        // [Authorize(Roles = "Manager,HR,Admin")] // Bạn có thể mở comment này nếu muốn phân quyền
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var data = await _advanceService.GetPendingRequestsAsync();
            return Ok(data);
        }

        // 5. API Quản lý xem toàn bộ lịch sử đơn ứng lương (kể cả đã duyệt / từ chối)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRequests()
        {
            var data = await _advanceService.GetAllAdvancesAsync();
            return Ok(data);
        }

        // 4. API Quản lý Duyệt / Từ chối đơn
        // [Authorize(Roles = "Manager,HR,Admin")]
        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessRequest(int id, [FromBody] ProcessAdvanceRequestDTO request)
        {
            // Lấy ID người duyệt từ Token
            var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("EmployeeID")?.Value;

            if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out int managerId))
                return Unauthorized(new { message = "Không xác định được danh tính Quản lý." });

            // LOGIC QUAN TRỌNG: Nếu từ chối thì BẮT BUỘC phải có lý do
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