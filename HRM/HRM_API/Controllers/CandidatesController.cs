using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidatesController : ControllerBase
    {
        private readonly ICandidateService _candidateService;
        private readonly IWebHostEnvironment _env;

        public CandidatesController(ICandidateService candidateService, IWebHostEnvironment env)
        {
            _candidateService = candidateService;
            _env = env;
        }

        [HttpPost("upload-cv")]
        [RequestSizeLimit(10_000_000)]
        [Consumes("multipart/form-data")] 
        public async Task<IActionResult> UploadCV(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "File không hợp lệ" });

            // Lấy đường dẫn wwwroot. Nếu WebRootPath null, dùng Path.Combine để tạo đường dẫn thủ công
            string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(rootPath, "uploads", "cvs");

            // Kiểm tra và tạo thư mục nếu chưa có
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về URL để Frontend lưu vào Database
            return Ok(new { cvUrl = $"/uploads/cvs/{uniqueFileName}" });
        }

        [HttpPost("apply")]
        public async Task<IActionResult> Apply(ApplyJobRequest request)
        {
            var result = await _candidateService.ApplyJobAsync(request);
            if (result) return Ok(new { message = "Ứng tuyển thành công!" });
            return BadRequest("Có lỗi xảy ra trong quá trình nộp hồ sơ.");
        }
    }
}
