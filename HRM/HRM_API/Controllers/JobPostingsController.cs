using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobPostingsController : ControllerBase
    {
        private readonly JobPostingService _service;
        public JobPostingsController(JobPostingService service) => _service = service;

        [HttpPatch("{id}/publish")] // Công khai tin đăng
        public async Task<IActionResult> Publish(int id, [FromBody] string description)
            => await _service.PublishJobPostingAsync(id, description) ? Ok() : BadRequest();

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

        [HttpPatch("{id}/reopen")] // MỞ LẠI TIN (Yêu cầu của bạn)
        public async Task<IActionResult> Reopen(int id)
            => await _service.ReopenJobPostingAsync(id) ? Ok() : BadRequest("Chỉ có thể mở lại tin đã đóng");
    }
}
