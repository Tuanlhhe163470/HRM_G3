using HRM_Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "HR, Admin")]
    public class TimesheetController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IMonthlyTimesheetService _monthlyTimesheetService;

        public TimesheetController(IAttendanceService attendanceService, IMonthlyTimesheetService monthlyTimesheetService)
        {
            _attendanceService = attendanceService;
            _monthlyTimesheetService = monthlyTimesheetService;
        }

        [HttpPost("calculate")]
        public async Task<IActionResult> CalculateCompanyTimesheet([FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                // Validate đầu vào cơ bản
                if (month < 1 || month > 12 || year < 2000)
                {
                    return BadRequest(new { message = "Tháng hoặc năm không hợp lệ!" });
                }

                // Gọi cỗ máy tính toán chạy
                await _attendanceService.CalculateCompanyTimesheetAsync(month, year);

                return Ok(new
                {
                    message = $"Đã tổng hợp thành công dữ liệu chấm công tháng {month}/{year} cho toàn công ty!",
                    status = "success"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi tính toán: " + ex.Message });
            }
        }

        [HttpGet("company-master")]
        public async Task<IActionResult> GetCompanyTimesheet([FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                if (month < 1 || month > 12 || year < 2000)
                    return BadRequest(new { message = "Tháng hoặc năm không hợp lệ!" });

                // Controller CHỈ gọi Service
                var data = await _monthlyTimesheetService.GetCompanyTimesheetsAsync(month, year);

                return Ok(new { data = data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải dữ liệu: " + ex.Message });
            }
        }
    }
}