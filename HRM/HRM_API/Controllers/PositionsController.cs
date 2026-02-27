using HRM_Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionsController : ControllerBase
    {
        private readonly HRMDbContext _context;

        public PositionsController(HRMDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var positions = await _context.Positions
                .Select(p => new { p.PositionID, p.PositionName })
                .ToListAsync();
            return Ok(positions);
        }
    }
}
