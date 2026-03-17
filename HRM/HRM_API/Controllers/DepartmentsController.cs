using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Department.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "HR, Admin, Manager")]
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
            await _departmentService.DeleteDepartmentAsync(id);
            return Ok(new { message = "Xóa phòng ban thành công" });
        }
    }
}