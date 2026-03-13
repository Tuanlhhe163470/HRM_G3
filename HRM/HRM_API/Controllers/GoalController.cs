using HRM_Application.DTOs.Goals;
using HRM_Application.Contracts.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HRM_Infrastructure.Data; // Thêm namespace này
using HRM_Domain.Entities;     // Thêm namespace này

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoalController : ControllerBase
    {
        private readonly IGoalService _goalService;
        private readonly HRMDbContext _context; // Thêm biến này

        // Inject thêm DBContext
        public GoalController(IGoalService goalService, HRMDbContext context)
        {
            _goalService = goalService;
            _context = context;
        }

        // API TẠO CYCLE GIẢ (Chạy cái này 1 lần duy nhất)
        [HttpPost("seed-cycle")]
        public IActionResult SeedCycle()
        {
            var cycle = new ReviewCycle
            {
                CycleName = "Kỳ đánh giá Test 2026",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(3),
                Status = "Active",
                Description = "Dữ liệu mẫu để test"
            };

            _context.ReviewCycles.Add(cycle);
            _context.SaveChanges();

            return Ok(new { message = "Đã tạo Cycle thành công!", cycleID = cycle.CycleID });
        }

        [HttpPost]
    public async Task<IActionResult> CreateGoal([FromBody] CreateGoalDTO request)
    {
        try
        {
            var result = await _goalService.CreateGoal(request);
            return Ok(new { message = "Tạo mục tiêu thành công!", data = result });
        }
        catch (Exception ex)
        {
            // SỬA ĐOẠN NÀY: Lấy thêm InnerException để xem lỗi gốc
            var errorMessage = ex.Message;
            var innerError = ex.InnerException != null ? ex.InnerException.Message : "";
            
            return BadRequest(new { 
                message = errorMessage, 
                details = innerError // <--- Cái này sẽ cho biết chính xác lỗi gì (FK, Data Type, v.v)
            });
        }
    }
}
}