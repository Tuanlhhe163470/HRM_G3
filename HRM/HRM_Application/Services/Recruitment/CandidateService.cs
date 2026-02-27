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
        // Bổ sung Repository quản lý bảng Interviews
        private readonly IInterviewRepository _interviewRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IEmailService _emailService;

        public CandidateService(
            ICandidateRepository candidateRepository,
            IJobPostingRepository jobRepo,
            IInterviewRepository interviewRepository, // Inject thêm vào đây
            IMapper mapper,
            IWebHostEnvironment webHostEnvironment,
            IEmailService emailService)
        {
            _candidateRepository = candidateRepository;
            _jobRepo = jobRepo;
            _interviewRepository = interviewRepository; // Gán giá trị
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _emailService = emailService;
        }

        // --- CÁC PHƯƠNG THỨC HỖ TRỢ CV ---
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
        public async Task<CandidateDto> GetCandidateByIdAsync(int id)
        {
            var candidate = await _candidateRepository.GetByIdAsync(id);
            return _mapper.Map<CandidateDto>(candidate);
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

        // --- XỬ LÝ TRẠNG THÁI ỨNG VIÊN ---
        public async Task<bool> ProcessCandidateAsync(int id, string action)
        {
            var candidate = await _candidateRepository.GetByIdAsync(id);
            if (candidate == null) return false;

            string jobTitle = candidate.JobPosting?.Title ?? "Vị trí đã ứng tuyển";

            if (action == "accept")
                return await _candidateRepository.UpdateStatusAsync(id, "Screening");

            if (action == "send_to_manager")
                return await _candidateRepository.UpdateStatusAsync(id, "Manager_Review");

            if (action == "manager_approve")
                return await _candidateRepository.UpdateStatusAsync(id, "Interview");

            if (action == "reject" || action == "manager_reject")
            {
                var result = await _candidateRepository.UpdateStatusAsync(id, "Rejected");
                if (result)
                {
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
        
        <p>Hy vọng sẽ có cơ hội hợp tác với bạn trong những dự án sắp tới. Chúc bạn luôn gặt hái được nhiều thành công trên con đường sự nghiệp.</p>
        
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


            return false; // Đảm bảo mọi nhánh code đều trả về giá trị
        }

        // --- LÊN LỊCH PHỎNG VẤN ---
        public async Task<bool> ScheduleInterviewAsync(ScheduleInterviewDto dto)
        {
            // 1. Kiểm tra ứng viên tồn tại
            var candidate = await _candidateRepository.GetByIdAsync(dto.CandidateID);
            if (candidate == null) return false;

            // 2. LOGIC KIỂM TRA: Ứng viên đã có lịch phỏng vấn chưa?
            // Sử dụng _interviewRepository để kiểm tra trong bảng dbo.Interviews
            var existingInterviews = await _interviewRepository.GetByCandidateIdAsync(dto.CandidateID);
            if (existingInterviews != null && existingInterviews.Any())
            {
                // Nếu đã có lịch, không cho phép lên lịch lại để tránh spam email
                throw new Exception("Ứng viên này đã được lên lịch phỏng vấn trước đó.");
            }

            // 3. Nếu chưa có, tiến hành lưu lịch mới
            var interview = _mapper.Map<Interview>(dto);
            interview.Result = "Pending";
            await _interviewRepository.AddAsync(interview);

            // 4. Cập nhật trạng thái ứng viên
            await _candidateRepository.UpdateStatusAsync(dto.CandidateID, "Interview");

            string jobTitle = candidate.JobPosting?.Title ?? "Vị trí ứng tuyển";
            string subject = $"[HRM System] Thư mời phỏng vấn - Vị trí {jobTitle}";

            string emailBody = $@"
<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;'>
    
    <div style='background-color: #154398; padding: 20px; text-align: center;'>
        <h2 style='color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px;'>
            HRM SYSTEM
        </h2>
    </div>
    
    <div style='padding: 30px; background-color: #ffffff;'>
        <p style='font-size: 16px;'>Chào <strong>{candidate.FullName}</strong>,</p>
        
        <p>
            Trước tiên, đội ngũ tuyển dụng <strong>HRM System</strong> xin cảm ơn bạn đã quan tâm và ứng tuyển 
            vào vị trí <strong>{jobTitle}</strong>.
        </p>

        <p>
            Sau quá trình xem xét hồ sơ, chúng tôi trân trọng thông báo bạn đã vượt qua vòng sàng lọc 
            và được mời tham gia buổi phỏng vấn với thông tin chi tiết như sau:
        </p>

        <div style='background-color: #f8fafc; border-left: 4px solid #154398; padding: 15px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>📅 Thời gian:</strong> {dto.InterviewDate:dd/MM/yyyy HH:mm}</p>
            <p style='margin: 5px 0;'><strong>📍 Địa điểm:</strong> {dto.Location}</p>
            <p style='margin: 5px 0;'><strong>💼 Hình thức:</strong> {dto.InterviewType}</p>
        </div>

        <p>
            Vui lòng phản hồi email này hoặc xác nhận tham gia trước thời gian phỏng vấn 
            để chúng tôi có thể chuẩn bị tốt nhất cho buổi trao đổi.
        </p>

        <p>
            Chúng tôi rất mong được gặp và trao đổi cùng bạn về cơ hội hợp tác sắp tới.
        </p>

        <p style='margin-top: 30px;'>Trân trọng,</p>
        <p><strong>Ban Tuyển dụng HRM System</strong></p>
    </div>
    
    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;'>
        <p style='margin: 5px 0;'>Đây là email tự động từ hệ thống quản trị nhân sự HRM.</p>
        <p style='margin: 5px 0;'>Vui lòng không phản hồi trực tiếp vào email này.</p>
    </div>
</div>";

            await _emailService.SendEmailAsync(candidate.Email, subject, emailBody);
            return true;
        }
        public async Task<IEnumerable<ScheduleInterviewDto>> GetAllInterviewsAsync()
        {
            // Lấy dữ liệu từ Repo và Map sang ScheduleInterviewDto để trả về
            var interviews = await _interviewRepository.GetAllWithCandidateAsync();
            return _mapper.Map<IEnumerable<ScheduleInterviewDto>>(interviews);
        }
    }

}