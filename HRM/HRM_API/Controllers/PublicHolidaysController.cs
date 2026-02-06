using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PublicHoliday.Requests;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicHolidaysController : ControllerBase
    {
        private readonly IPublicHolidayService _holidayService;

        public PublicHolidaysController(IPublicHolidayService holidayService)
        {
            _holidayService = holidayService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            var result = await _holidayService.GetAllHolidaysAsync(filter);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _holidayService.GetHolidayByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePublicHolidayRequest request)
        {
            await _holidayService.CreateHolidayAsync(request);
            return Ok(new { message = "Thêm ngày lễ thành công!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePublicHolidayRequest request)
        {
            await _holidayService.UpdateHolidayAsync(id, request);
            return Ok(new { message = "Cập nhật ngày lễ thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _holidayService.DeleteHolidayAsync(id);
            return Ok(new { message = "Xóa ngày lễ thành công!" });
        }
    }
}