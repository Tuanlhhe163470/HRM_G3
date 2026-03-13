using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidatesController : ControllerBase
    {
        private readonly ICandidateService _candidateService;

        public CandidatesController(ICandidateService candidateService)
        {
            _candidateService = candidateService;
        }

        /// <summary>
        /// API Ứng tuyển: Nhận cả thông tin text và file CV vật lý thông qua FormData
        /// </summary>
        [HttpPost("apply")]
        [Consumes("multipart/form-data")] // Chống lỗi 415 bằng cách chỉ định rõ kiểu dữ liệu nhận vào
        public async Task<IActionResult> Apply([FromForm] ApplyJobRequest request) // Dùng [FromForm] để bóc tách file từ request
        {
            // Kiểm tra tính hợp lệ của JobID để tránh lỗi Foreign Key
            if (request.JobID <= 0)
            {
                return BadRequest(new { message = "Mã tin tuyển dụng (JobID) không hợp lệ." });
            }

            // Kiểm tra bắt buộc phải có file CV gửi kèm
            if (request.CVFile == null || request.CVFile.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng đính kèm tệp hồ sơ CV." });
            }

            // Gọi Service xử lý (Lưu file GUID và lưu Database đồng thời)
            var result = await _candidateService.ApplyJobAsync(request);

            return result
                ? Ok(new { message = "Ứng tuyển thành công!" })
                : BadRequest(new { message = "Đã có lỗi xảy ra trong quá trình xử lý hồ sơ." });
        }

        /// <summary>
        /// Lấy danh sách ứng viên cho HR/Manager kèm theo phân quyền
        /// </summary>
        [HttpGet("admin-list")]
        [Authorize] // Bắt buộc đăng nhập để lấy thông tin Role từ Token
        public async Task<IActionResult> GetAdminList()
        {
            // Sửa lỗi "Possible null reference": Gán chuỗi rỗng nếu không tìm thấy Role
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

            var deptIdStr = User.FindFirst("DepartmentID")?.Value;
            int? deptId = !string.IsNullOrEmpty(deptIdStr) ? int.Parse(deptIdStr) : null;

            // Truyền role đã xử lý chống null xuống Service
            var result = await _candidateService.GetCandidatesForAdminAsync(role, deptId);
            return Ok(result);
        }
        // Endpoint: api/Candidates/1/process?action=accept (hoặc reject)
        [HttpPatch("{id}/process")]
        public async Task<IActionResult> ProcessCandidate(int id, [FromQuery] string action)
        {
            var success = await _candidateService.ProcessCandidateAsync(id, action);
            if (success) return Ok(new { message = "Xử lý hồ sơ thành công" });
            return BadRequest(new { message = "Có lỗi xảy ra trong quá trình xử lý" });
        }
    }
}