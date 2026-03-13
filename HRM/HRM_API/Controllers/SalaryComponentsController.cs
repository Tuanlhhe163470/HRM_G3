using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "HR, Admin")] // Bật lên khi đã cấu hình JWT
    public class SalaryComponentsController : ControllerBase
    {
        private readonly ISalaryComponentService _service;

        public SalaryComponentsController(ISalaryComponentService service)
        {
            _service = service;
        }

        // GET: api/SalaryComponents
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllComponentsAsync();
            return Ok(result);
        }

        // GET: api/SalaryComponents/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetComponentByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST: api/SalaryComponents
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSalaryComponentDTO request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _service.CreateComponentAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.ComponentID }, result);
        }

        // PUT: api/SalaryComponents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSalaryComponentDTO request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _service.UpdateComponentAsync(id, request);
            if (!success) return NotFound();

            return NoContent();
        }

        // DELETE: api/SalaryComponents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteComponentAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
