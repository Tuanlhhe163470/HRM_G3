using HRM_Application.Contracts.Services;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobRequisitionsController : ControllerBase
    {
        private readonly JobRequisitionService _service;
        public JobRequisitionsController(JobRequisitionService service) => _service = service;

        [HttpPost] // Tạo mới yêu cầu
        public async Task<IActionResult> Create([FromBody] JobPosting req) => Ok(await _service.CreateRequisitionAsync(req));

        [HttpPatch("{id}/approve")] // Phê duyệt
        public async Task<IActionResult> Approve(int id, [FromQuery] bool isApproved)
        {
            var result = await _service.ApproveRequisitionAsync(id, isApproved);
            return result ? Ok(new { message = "Xử lý phê duyệt thành công" }) : BadRequest("Không thể phê duyệt");
        }
    }
}
