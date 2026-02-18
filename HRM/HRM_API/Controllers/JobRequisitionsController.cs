using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobRequisitionsController : ControllerBase
    {
        private readonly JobRequisitionService _requisitionService;

        public JobRequisitionsController(JobRequisitionService requisitionService)
        {
            _requisitionService = requisitionService;
        }

        // POST: api/v1/JobRequisitions
        // Feature: Recruitment Request Management
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobPosting requisition)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdRequisition = await _requisitionService.CreateRequisitionAsync(requisition);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdRequisition.JobID },
                createdRequisition
            );
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Phương thức bổ trợ để trả về dữ liệu sau khi tạo thành công
            return Ok();
        }
        // GET: api/v1/JobRequisitions/pending
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var result = await _requisitionService.GetPendingRequisitionsAsync();
            return Ok(result);
        }

        // PATCH: api/v1/JobRequisitions/{id}/approve
        // Feature: Recruitment Approval
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromQuery] bool isApproved)
        {
            var success = await _requisitionService.ApproveRequisitionAsync(id, isApproved);

            if (!success)
                return BadRequest(new { message = "Không thể phê duyệt yêu cầu này." });

            return Ok(new
            {
                message = isApproved ? "Yêu cầu đã được phê duyệt." : "Yêu cầu đã bị từ chối."
            });
        }
    }
}
