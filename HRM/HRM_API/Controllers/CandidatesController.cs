using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Apply([FromForm] ApplyJobRequest request)
        {
            if (request.JobID <= 0)
            {
                return BadRequest(new { message = "Mã tin tuyển dụng (JobID) không hợp lệ." });
            }

            if (request.CVFile == null || request.CVFile.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng đính kèm tệp hồ sơ CV." });
            }

            var result = await _candidateService.ApplyJobAsync(request);

            return result
                ? Ok(new { message = "Ứng tuyển thành công!" })
                : BadRequest(new { message = "Đã có lỗi xảy ra trong quá trình xử lý hồ sơ." });
        }

        /// <summary>
        /// Lấy danh sách ứng viên cho HR/Manager kèm theo phân quyền
        /// </summary>
        [HttpGet("admin-list")]
        [Authorize]
        public async Task<IActionResult> GetAdminList()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

            var deptIdStr = User.FindFirst("DepartmentID")?.Value;
            int? deptId = !string.IsNullOrEmpty(deptIdStr) ? int.Parse(deptIdStr) : null;

            var result = await _candidateService.GetCandidatesForAdminAsync(role, deptId);
            return Ok(result);
        }

        /// <summary>
        /// Xử lý trạng thái hồ sơ ứng viên (Screening, Manager_Review, Interview, Reject)
        /// </summary>
        [HttpPatch("{id}/process")]
        public async Task<IActionResult> ProcessCandidate(int id, [FromQuery] string action)
        {
            var success = await _candidateService.ProcessCandidateAsync(id, action);
            if (success) return Ok(new { message = "Xử lý hồ sơ thành công" });
            return BadRequest(new { message = "Có lỗi xảy ra trong quá trình xử lý" });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _candidateService.GetCandidateByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy ứng viên." });
            return Ok(result);
        }
        /// <summary>
        /// API Lên lịch phỏng vấn và gửi Email mời phỏng vấn tự động
        /// </summary>
        [HttpPost("schedule-interview")]
        [Authorize(Roles = "HR")] // Chỉ cho phép HR thiết lập lịch hẹn
        public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
        {
            if (dto == null || dto.CandidateID <= 0)
            {
                return BadRequest(new { message = "Thông tin lịch hẹn không hợp lệ." });
            }

            // Gọi Service để thực hiện lưu vào bảng Interviews và gửi Email
            var result = await _candidateService.ScheduleInterviewAsync(dto);

            if (result)
            {
                return Ok(new { message = "Lên lịch phỏng vấn và gửi email mời thành công!" });
            }

            return BadRequest(new { message = "Không thể lên lịch phỏng vấn. Vui lòng kiểm tra lại thông tin." });
        }

        [HttpGet("all-interviews")]
        [Authorize(Roles = "HR, Manager")]
        public async Task<IActionResult> GetAllInterviews()
        {
            var result = await _candidateService.GetAllInterviewsAsync();
            return Ok(result);
        }
        /// <summary>
        /// API dành cho Manager đánh giá ứng viên sau phỏng vấn
        /// </summary>
        [HttpPost("evaluate")]
        [Authorize(Roles = "Manager")] 
        public async Task<IActionResult> EvaluateCandidate([FromBody] EvaluationRequest request)
        {
            if (request == null || request.CandidateID <= 0)
            {
                return BadRequest(new { message = "Thông tin đánh giá không hợp lệ." });
            }

            var result = await _candidateService.EvaluateCandidateAsync(request);

            if (result)
            {
                return Ok(new { message = "Lưu đánh giá và cập nhật trạng thái ứng viên thành công!" });
            }

            return BadRequest(new { message = "Không tìm thấy lịch phỏng vấn phù hợp để đánh giá ứng viên này." });
        }
        [HttpPost("{id}/send-fail-email")]
        [Authorize(Roles = "HR")] 
        public async Task<IActionResult> SendFailEmail(int id)
        {
            // Gọi service để thực hiện gửi mail và cập nhật IsFailEmailSent trong DB
            var result = await _candidateService.SendFailEmailAsync(id);

            if (result)
            {
                return Ok(new { message = "Gửi email thông báo trượt thành công!" });
            }

            return BadRequest(new
            {
                message = "Không thể gửi email. Có thể ứng viên không ở trạng thái Fail hoặc email đã được gửi trước đó."
            });
        }
        [HttpPost("create-offer")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> CreateOffer([FromBody] CreateOfferRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _candidateService.CreateOfferAsync(request);

            if (result)
                return Ok(new { message = "Offer đã được lưu và gửi email thành công." });

            return StatusCode(500, new { message = "Offer đã được lưu nhưng email chưa gửi được. Vui lòng kiểm tra lại." });
        }
        [HttpPatch("{id}/hire")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> HireCandidate(int id)
        {
            var result = await _candidateService.ConfirmHireAsync(id);
            return result ? Ok(new { message = "Xác nhận trúng tuyển thành công!" }) : BadRequest();
        }

        // 2. API Xác nhận Từ chối Offer
        [HttpPatch("{id}/decline-offer")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> DeclineOffer(int id, [FromQuery] string reason)
        {
            var result = await _candidateService.DeclineOfferAsync(id, reason);
            return result ? Ok(new { message = "Đã ghi nhận ứng viên từ chối Offer." }) : BadRequest();
        }
    }
}