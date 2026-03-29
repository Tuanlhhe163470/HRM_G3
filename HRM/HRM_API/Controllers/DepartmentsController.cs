using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Department.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            var response = await _departmentService.GetAllDepartmentsAsync(filter);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _departmentService.GetDepartmentByIdAsync(id);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
        {
            await _departmentService.CreateDepartmentAsync(request);
            return Ok(new { message = "Tạo phòng ban thành công" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentRequest request)
        {
            await _departmentService.UpdateDepartmentAsync(id, request);
            return Ok(new { message = "Cập nhật phòng ban thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _departmentService.DeleteDepartmentAsync(id);
                return Ok(new { message = "Xóa phòng ban thành công" });
            }
            catch (InvalidOperationException ex)
            {
                // Bắt lỗi nghiệp vụ (phòng ban đang có nhân viên) và trả về 400 Bad Request
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                // Bắt lỗi không tìm thấy và trả về 404 Not Found
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Các lỗi hệ thống khác trả về 500
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpGet("{id}/employees")]
        public async Task<IActionResult> GetEmployeesByDept(int id)
        {
            try
            {
                var response = await _departmentService.GetEmployeesByDepartmentAsync(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}