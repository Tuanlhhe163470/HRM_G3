using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Positions;
using HRM_Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "HR, Admin, Manager")]
    public class PositionsController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionsController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var positions = await _positionService.GetAllPositionsAsync();
            return Ok(positions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var position = await _positionService.GetPositionByIdAsync(id);
            if (position == null)
            {
                return NotFound(new { message = $"Không tìm thấy chức danh với ID = {id}" });
            }
            return Ok(position);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePositionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _positionService.CreatePositionAsync(request);

                return CreatedAtAction(nameof(GetById), new { id = result.PositionID }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePositionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (id != request.PositionID)
            {
                return BadRequest(new { message = "ID trên URL và trong dữ liệu không khớp nhau." });
            }

            try
            {
                var isSuccess = await _positionService.UpdatePositionAsync(id, request);
                if (!isSuccess)
                {
                    return NotFound(new { message = $"Không tìm thấy chức danh với ID = {id} để cập nhật." });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var isSuccess = await _positionService.DeletePositionAsync(id);
                if (!isSuccess)
                {
                    return NotFound(new { message = $"Không tìm thấy chức danh với ID = {id} để xóa." });
                }

                return NoContent(); 
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }
    }
}