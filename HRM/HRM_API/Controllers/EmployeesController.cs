using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.Services.CoreHR;
using HRM_Application.DTOs.Employees.Requests;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeesController(IEmployeeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            return Ok(await _service.GetAllEmployeesAsync(filter));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _service.GetEmployeeByIdAsync(id));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
        {
            await _service.CreateEmployeeAsync(request);
            return Ok("Create success");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest request)
        {
            await _service.UpdateEmployeeAsync(id, request);
            return Ok("Update success");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteEmployeeAsync(id);
            return Ok("Delete success");
        }
    }
}

