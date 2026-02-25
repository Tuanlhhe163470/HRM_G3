using HRM_Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly HRMDbContext _context; 

        public DepartmentsController(HRMDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var departments = await _context.Departments
                .Select(d => new { d.DepartmentID, d.DepartmentName })
                .ToListAsync();
            return Ok(departments);
        }
    }
}
