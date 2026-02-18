using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobPostingsController : ControllerBase
    {
        private readonly JobPostingService _jobService;

        public JobPostingsController(JobPostingService jobService)
        {
            _jobService = jobService;
        }

        /// <summary>
        /// Feature: Job Posting Management
        /// API để HR chính thức đăng tin tuyển dụng lên website
        /// </summary>
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> Publish(int id, [FromBody] string jobDescription)
        {
            var success = await _jobService.PublishJobPostingAsync(id, jobDescription);

            if (!success)
                return BadRequest(new { message = "Không thể đăng tin. Vui lòng kiểm tra trạng thái phê duyệt của yêu cầu." });

            return Ok(new { message = "Tin tuyển dụng đã được đăng công khai thành công." });
        }
        // PUT: api/v1/JobPostings/{id}
        // Feature: Update Job Posting
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] JobPosting updatedData)
        {
            var success = await _jobService.UpdateJobPostingAsync(id, updatedData);
            if (!success) return NotFound(new { message = "Không tìm thấy tin tuyển dụng." });

            return Ok(new { message = "Cập nhật tin tuyển dụng thành công." });
        }

        // PATCH: api/v1/JobPostings/{id}/close
        // Feature: Close Job Posting
        [HttpPatch("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var success = await _jobService.CloseJobPostingAsync(id);
            if (!success) return BadRequest(new { message = "Không thể đóng tin tuyển dụng này." });

            return Ok(new { message = "Tin tuyển dụng đã được đóng." });
        }
    }
}
