using HRM_Application.DTOs;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using HRM_Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly HRMDbContext _context;

        public EmployeesController(HRMDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _context.Employees // Bảng Employees của bạn
                .Select(e => new EmployeeDTO
                {
                    EmployeeID = e.EmployeeID,
                    FullName = e.FullName,
                    Email = e.Email,
                    Phone = e.Phone,
                    Status = e.Status
                })
                .ToListAsync();

            return Ok(employees);
        }
    }
}