using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
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
    }
}
