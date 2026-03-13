using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.LaborContract;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "HR, Admin")]
    public class LaborContractsController : ControllerBase
    {
        private readonly ILaborContractService _service;

        public LaborContractsController(ILaborContractService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            return Ok(await _service.GetAllContractsAsync(filter));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try { return Ok(await _service.GetContractByIdAsync(id)); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // --- API MỞ RỘNG CHO PAYROLL ---
        [HttpGet("active/employee/{employeeId}")]
        public async Task<IActionResult> GetActiveByEmployeeId(int employeeId)
        {
            var result = await _service.GetActiveContractByEmployeeIdAsync(employeeId);
            if (result == null) return Ok(new { message = "Nhân viên này hiện không có hợp đồng Active nào." });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLaborContractRequest request)
        {
            try
            {
                await _service.CreateContractAsync(request);
                return Ok(new { message = "Tạo hợp đồng thành công!" });
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLaborContractRequest request)
        {
            try
            {
                await _service.UpdateContractAsync(id, request);
                return Ok(new { message = "Cập nhật hợp đồng thành công!" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteContractAsync(id);
                return Ok(new { message = "Xóa hợp đồng thành công!" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }
    }
}