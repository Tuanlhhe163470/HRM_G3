using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PublicHoliday.Requests;
using HRM_Application.DTOs.Shift.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftConfigController : ControllerBase
    {
        private readonly IShiftService _shiftService;
        public ShiftConfigController(IShiftService shiftService)
        {
            _shiftService = shiftService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            var result = await _shiftService.GetAllShiftsAsync(filter);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateShiftRequest request)
        {
            await _shiftService.CreateShiftAsync(request);
            return Ok(new { message = "Tạo ca làm việc thành công!" });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _shiftService.GetShiftByIdAsync(id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateShiftRequest request)
        {
            await _shiftService.UpdateShiftAsync(id, request);
            return Ok(new { message = "Cập nhật ca làm việc thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _shiftService.DeleteShiftAsync(id);
            return Ok(new { message = "Xóa ca làm việc thành công!" });
        }
    }
}
