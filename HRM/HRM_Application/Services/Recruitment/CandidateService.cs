using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.Recruitment
{
    public class CandidateService : ICandidateService
    {
        private readonly ICandidateRepository _candidateRepository;
        private readonly IJobPostingRepository _jobRepo;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IEmailService _emailService; // Bổ sung EmailService

        public CandidateService(
            ICandidateRepository candidateRepository,
            IJobPostingRepository jobRepo,
            IMapper mapper,
            IWebHostEnvironment webHostEnvironment,
            IEmailService emailService) // Inject EmailService
        {
            _candidateRepository = candidateRepository;
            _jobRepo = jobRepo;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _emailService = emailService;
        }

        public async Task<string> UploadCVAsync(IFormFile file)
        {
            if (file == null || file.Length == 0) return string.Empty;

            var folderPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "cvs");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var newFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(folderPath, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
                await stream.FlushAsync();
            }

            return $"/uploads/cvs/{newFileName}";
        }

        public async Task<bool> ApplyJobAsync(ApplyJobRequest request)
        {
            var job = await _jobRepo.GetByIdAsync(request.JobID);
            if (job == null) throw new Exception("Công việc không tồn tại.");

            string savedCvUrl = "";
            if (request.CVFile != null)
            {
                savedCvUrl = await UploadCVAsync(request.CVFile);
            }

            try
            {
                var candidate = new Candidate
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    Phone = request.Phone,
                    CVUrl = savedCvUrl,
                    JobID = request.JobID,
                    Source = "Website",
                    Status = "Applied",
                    CreatedAt = DateTime.Now
                };

                await _candidateRepository.AddAsync(candidate);

                if (!string.IsNullOrEmpty(savedCvUrl) && candidate.CandidateID > 0)
                {
                    string root = _webHostEnvironment.WebRootPath;
                    string oldRelativePath = savedCvUrl.TrimStart('/');
                    string oldFullPath = Path.Combine(root, oldRelativePath);

                    string extension = Path.GetExtension(oldFullPath);
                    string newFileName = $"cv_id{candidate.CandidateID}{extension}";
                    string newFullPath = Path.Combine(root, "uploads", "cvs", newFileName);

                    if (File.Exists(oldFullPath))
                    {
                        if (File.Exists(newFullPath)) File.Delete(newFullPath);
                        File.Move(oldFullPath, newFullPath);

                        candidate.CVUrl = $"/uploads/cvs/{newFileName}";
                        await _candidateRepository.UpdateAsync(candidate);
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                if (!string.IsNullOrEmpty(savedCvUrl))
                {
                    string root = _webHostEnvironment.WebRootPath;
                    string fullPath = Path.Combine(root, savedCvUrl.TrimStart('/'));
                    if (File.Exists(fullPath)) File.Delete(fullPath);
                }
                throw new Exception("Lỗi khi nộp hồ sơ: " + ex.Message);
            }
        }

        public async Task<IEnumerable<CandidateDto>> GetCandidatesForAdminAsync(string role, int? departmentId)
        {
            var candidates = await _candidateRepository.GetAllWithJobAsync();

            if (role == "Manager" && departmentId.HasValue)
            {
                candidates = candidates.Where(c =>
                    c.JobPosting != null &&
                    c.JobPosting.DepartmentID == departmentId.Value);
            }

            return _mapper.Map<IEnumerable<CandidateDto>>(candidates);
        }

        public async Task<bool> ProcessCandidateAsync(int id, string action)
        {
            var candidate = await _candidateRepository.GetByIdAsync(id);
            if (candidate == null) return false;

            if (action == "accept")
            {
                return await _candidateRepository.UpdateStatusAsync(id, "Screening");
            }
            else if (action == "reject")
            {
                var result = await _candidateRepository.UpdateStatusAsync(id, "Rejected");
                if (result)
                {
                    // Sử dụng biến jobTitle để tránh gọi trực tiếp vào candidate.JobTitle không tồn tại
                    string jobTitle = candidate.JobPosting?.Title ?? "Vị trí đã ứng tuyển";

                    // Sửa lỗi tại đây: thay candidate.JobTitle bằng jobTitle
                    string subject = $"[HRM System] Thông báo kết quả ứng tuyển - Vị trí {jobTitle}";

                    string body = $@"
<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;'>
    <div style='background-color: #154398; padding: 20px; text-align: center;'>
        <h2 style='color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px;'>HRM SYSTEM</h2>
    </div>
    
    <div style='padding: 30px; background-color: #ffffff;'>
        <p style='font-size: 16px;'>Chào <strong>{candidate.FullName}</strong>,</p>
        
        <p>Lời đầu tiên, đội ngũ tuyển dụng <strong>HRM System</strong> xin cảm ơn bạn đã dành thời gian và tâm huyết quan tâm đến vị trí <strong>{jobTitle}</strong>.</p>
        
        <p>Sau khi xem xét kỹ lưỡng hồ sơ và các yêu cầu chuyên môn, chúng tôi rất tiếc phải thông báo rằng bạn chưa phù hợp để đi tiếp cùng chúng tôi trong đợt tuyển dụng này.</p>
        
        <div style='background-color: #f8fafc; border-left: 4px solid #154398; padding: 15px; margin: 20px 0;'>
            <p style='margin: 0; font-style: italic; color: #555;'>
                ""Hồ sơ của bạn đã được chúng tôi lưu lại trong hệ thống. Chúng tôi sẽ chủ động liên hệ ngay khi có vị trí mới phù hợp với kỹ năng và định hướng của bạn.""
            </p>
        </div>
        
        <p>Hy vọng sẽ có cơ hội hợp tác với bạn trong những dự án sắp tới. Chúc bạn luôn giữ vững đam mê và gặt hái được nhiều thành công trên con đường sự nghiệp.</p>
        
        <p style='margin-top: 30px;'>Trân trọng,</p>
        <p><strong>Ban Tuyển dụng HRM System</strong></p>
    </div>
    
    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;'>
        <p style='margin: 5px 0;'>Đây là email tự động từ hệ thống quản trị nhân sự HRM.</p>
        <p style='margin: 5px 0;'>Vui lòng không phản hồi trực tiếp vào email này.</p>
    </div>
</div>";

                    await _emailService.SendEmailAsync(candidate.Email, subject, body);
                }
                return result;
            }
            return false;
        }
    }
}