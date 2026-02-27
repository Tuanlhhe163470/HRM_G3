using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobPostingsController : ControllerBase
    {
        // Chỉ sử dụng duy nhất JobPostingService vì đã gộp logic phê duyệt vào đây
        private readonly JobPostingService _jobService;

        public JobPostingsController(JobPostingService jobService)
        {
            _jobService = jobService;
        }

        #region PHẦN 1: QUY TRÌNH PHÊ DUYỆT (REQUISITION FLOW)

        // 1. Tạo yêu cầu tuyển dụng mới
        [Authorize(Roles = "Manager,HR")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobPosting jobPosting)
        {
            // 1. Lấy giá trị chuỗi từ Claim
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("Id")?.Value
                  ?? User.FindFirst("userId")?.Value
                  ?? User.FindFirst("sub")?.Value;

            // 2. Kiểm tra và ép kiểu từ string sang int trước khi gán
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                // Sử dụng int.Parse hoặc int.TryParse để chuyển đổi
                if (int.TryParse(userIdClaim, out int userId))
                {
                    jobPosting.CreatedBy = userId; // Gán giá trị đã ép kiểu thành công
                }
            }

            jobPosting.CreatedAt = DateTime.Now;
            var result = await _jobService.CreateJobRequestAsync(jobPosting);
            return Ok(result);
        }

        // 2. Manager phê duyệt yêu cầu
        [Authorize(Roles = "Manager")]
        [HttpGet("pending-by-dept")]
        public async Task<IActionResult> GetPendingByDept()
        {
            // Lấy DepartmentID từ Claim của người dùng đang đăng nhập
            var deptIdClaim = User.FindFirst("DepartmentId")?.Value;

            if (string.IsNullOrEmpty(deptIdClaim) || !int.TryParse(deptIdClaim, out int deptId))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin phòng ban của quản lý." });
            }

            var jobs = await _jobService.GetPendingByDeptAsync(deptId);
            return Ok(jobs);
        }

        [Authorize(Roles = "Manager")]
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromQuery] bool isApproved)
        {
            // Gọi hàm đã gộp trong JobPostingService
            var result = await _jobService.ApproveJobRequestAsync(id, isApproved);
            return result
                ? Ok(new { message = isApproved ? "Yêu cầu đã được phê duyệt." : "Yêu cầu đã bị từ chối." })
                : BadRequest(new { message = "Không thể xử lý phê duyệt yêu cầu này." });
        }

        #endregion

        #region PHẦN 2: QUẢN LÝ TIN ĐĂNG (POSTING MANAGEMENT)

        [AllowAnonymous]
        [HttpGet("published")]
        public async Task<IActionResult> GetPublished()
        {
            var jobs = await _jobService.GetPublishedJobsAsync();
            return Ok(jobs ?? new List<JobPosting>());
        }

        [Authorize(Roles = "HR")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _jobService.GetAllForHRAsync();

            return Ok(jobs);
        }

        [Authorize(Roles = "HR")]
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> Publish(int id, [FromBody] PublishJobRequest request)
        {
            var result = await _jobService.PublishJobPostingAsync(id, request.Description);
            return result ? Ok(new { message = "Thành công" }) : BadRequest();
        }

        [Authorize(Roles = "HR")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] JobPosting updatedData)
        {
            var success = await _jobService.UpdateJobPostingAsync(id, updatedData);
            return success
                ? Ok(new { message = "Cập nhật thành công." })
                : BadRequest(new { message = "Cập nhật thất bại. Tin có thể đã bị đóng hoặc không tồn tại." });
        }

        [Authorize(Roles = "HR,Manager")]
        [HttpPatch("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var result = await _jobService.CloseJobPostingAsync(id);
            return result ? Ok(new { message = "Đã đóng tin tuyển dụng." }) : BadRequest();
        }

        [Authorize(Roles = "HR")]
        [HttpPatch("{id}/reopen")]
        public async Task<IActionResult> Reopen(int id, [FromBody] ReopenJobRequest request)
        {
            // Kiểm tra tính hợp lệ của Request DTO
            if (request == null || request.NewExpiryDate <= DateTime.Now)
            {
                return BadRequest(new { message = "Ngày hết hạn mới không hợp lệ." });
            }

            // Gọi Service xử lý logic
            var result = await _jobService.ReopenJobPostingAsync(id, request.NewExpiryDate);

            if (!result)
            {
                return BadRequest(new { message = "Không thể mở lại tin. Vui lòng kiểm tra trạng thái 'Closed' của tin." });
            }

            return Ok(new { message = "Đã mở lại tin tuyển dụng thành công." });
        }

        [Authorize(Roles = "HR")]
        [HttpPatch("{id}/update-hired")]
        public async Task<IActionResult> UpdateHired(int id)
        {
            var success = await _jobService.UpdateHiredCountAsync(id);
            return success
                ? Ok(new { message = "Cập nhật số lượng trúng tuyển thành công." })
                : BadRequest(new { message = "Không thể cập nhật tin tuyển dụng." });
        }
        #endregion
    }
}