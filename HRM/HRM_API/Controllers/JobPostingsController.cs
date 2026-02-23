using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "HR")]
    public class JobPostingsController : ControllerBase
    {
        private readonly JobPostingService _service;
        public JobPostingsController(JobPostingService service) => _service = service;

        [HttpPatch("{id}/publish")] // Công khai tin đăng
        public async Task<IActionResult> Publish(int id, [FromBody] string description)
            => await _service.PublishJobPostingAsync(id, description) ? Ok() : BadRequest();

        [AllowAnonymous]
        [HttpGet("published")]
        public async Task<IActionResult> GetPublished()
        {
            var jobs = await _service.GetPublishedJobsAsync();

            if (jobs == null || !jobs.Any())
                return Ok(new List<JobPosting>()); // Trả về mảng rỗng nếu không có tin nào

            return Ok(jobs);
        }
        [HttpPatch("{id}/close")] // Đóng tin
        public async Task<IActionResult> Close(int id)
            => await _service.CloseJobPostingAsync(id) ? Ok() : BadRequest();

        public class ReopenRequest
        {
            public DateTime NewExpiryDate { get; set; }
        }

        [HttpPatch("{id}/reopen")]
        public async Task<IActionResult> Reopen(int id, [FromBody] ReopenRequest request)
        {
            // Kiểm tra nếu dữ liệu ngày tháng không hợp lệ (null hoặc mặc định)
            if (request.NewExpiryDate <= DateTime.Now)
            {
                return BadRequest(new { message = "Ngày hết hạn mới phải là một ngày trong tương lai." });
            }

            var result = await _service.ReopenJobPostingAsync(id, request.NewExpiryDate);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Không thể mở lại tin. Vui lòng kiểm tra ID hoặc trạng thái tin (chỉ mở lại tin đã Closed)."
                });
            }

            return Ok(new { message = "Mở lại tin tuyển dụng thành công." });
        }

        [HttpPut("{id}")] // Cập nhật tin đăng 
        public async Task<IActionResult> Update(int id, [FromBody] JobPosting updatedData)
        {
            // Gọi service xử lý logic
            var success = await _service.UpdateJobPostingAsync(id, updatedData);

            if (!success)
            {
                // Trả về thông báo lỗi chi tiết
                return BadRequest(new
                {
                    message = "Không thể cập nhật. Tin tuyển dụng không tồn tại hoặc đã bị đóng (Closed)."
                });
            }

            return Ok(new { message = "Cập nhật tin tuyển dụng thành công." });
        }
    }
}
