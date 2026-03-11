using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.LeaveBalance.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "HR, Admin")]
    public class LeaveBalancesController : ControllerBase
    {
        private readonly ILeaveBalanceService _service;

        public LeaveBalancesController(ILeaveBalanceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            try
            {
                var result = await _service.GetAllAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet("employee/{employeeId}/year/{year}/leavetype/{leaveTypeId}")]
        public async Task<IActionResult> GetByEmployeeAndYear(int employeeId, int year, int leaveTypeId)
        {
            try
            {
                var result = await _service.GetByEmployeeAndYearAsync(employeeId, leaveTypeId, year);
                if (result == null) return NotFound(new { message = "Không tìm thấy quỹ phép cho nhân viên này trong năm yêu cầu." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateBalances([FromBody] GenerateLeaveBalanceRequest request)
        {
            try
            {
                await _service.GenerateAnnualLeaveBalancesAsync(request);
                return Ok(new { message = $"Đã khởi tạo thành công quỹ phép cho năm {request.Year}." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPut("{id}/adjust")]
        public async Task<IActionResult> AdjustBalance(int id, [FromBody] AdjustLeaveBalanceRequest request)
        {
            try
            {
                await _service.AdjustLeaveBalanceAsync(id, request);
                return Ok(new { message = "Cập nhật tổng số ngày phép thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}