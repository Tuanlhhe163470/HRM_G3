using HRM_Application.Contracts.Services;
using HRM_Application.DTOs;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeSalaryConfigsController : ControllerBase
    {
        private readonly IEmployeeSalaryConfigService _service;

        public EmployeeSalaryConfigsController(IEmployeeSalaryConfigService service)
        {
            _service = service;
        }

        // Lấy cấu hình lương của 1 nhân viên
        [HttpGet("Employee/{employeeId}")]
        public async Task<IActionResult> GetConfigByEmployee(int employeeId)
        {
            var result = await _service.GetConfigsByEmployeeIdAsync(employeeId);
            return Ok(result);
        }

        // Gán hoặc Cập nhật khoản lương cho nhân viên
        [HttpPost("Assign")]
        public async Task<IActionResult> AssignSalary([FromBody] AssignSalaryConfigDTO request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _service.AssignOrUpdateConfigAsync(request);
            return Ok(new { message = "Thiết lập lương thành công!" });
        }

        // Xóa một khoản lương của nhân viên
        [HttpDelete("{configId}")]
        public async Task<IActionResult> RemoveSalary(int configId)
        {
            var success = await _service.RemoveConfigAsync(configId);
            if (!success) return NotFound(new { message = "Không tìm thấy cấu hình lương này." });

            return Ok(new { message = "Đã gỡ khoản lương khỏi nhân viên." });
        }
    }
}