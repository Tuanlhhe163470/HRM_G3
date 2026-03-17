using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using HRM_Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
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
        private readonly IOfferRepository _offerRepository;
        private readonly ILogger<CandidateService> _logger;
        private readonly JobPostingService _jobService;
        public CandidateService(
            ICandidateRepository candidateRepository,
            IJobPostingRepository jobRepo,
            IInterviewRepository interviewRepository, // Inject thêm vào đây
            IMapper mapper,
            IWebHostEnvironment webHostEnvironment,
            IEmailService emailService,
            IOfferRepository offerRepository,
            ILogger<CandidateService> logger,
            JobPostingService jobService)
        {
            _candidateRepository = candidateRepository;
            _jobRepo = jobRepo;
            _interviewRepository = interviewRepository; // Gán giá trị
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _emailService = emailService;
            _offerRepository = offerRepository;
            _logger = logger;
            _jobService = jobService;
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
            if (candidate == null) return null;

            var dto = _mapper.Map<CandidateDto>(candidate);

            // Lấy Offer cuối cùng để hiển thị lương trên Modal Frontend
            var latestOffer = (await _offerRepository.GetOffersByCandidateIdAsync(id))
                                ?.OrderByDescending(o => o.OfferedDate)
                                .FirstOrDefault();

            if (latestOffer != null)
            {
                dto.OfferedSalary = latestOffer.OfferedSalary;
                dto.JoinDate = latestOffer.JoinDate;
                dto.OfferNote = latestOffer.Note;
            }

            return dto;
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
        <p style='margin: 5px 0;'>Vui lòng phản hồi sớm nhất có thể để chúng tôi có thể sắp xếp một buổi phỏng vấn với bạn.</p>
        <p style='margin: 5px 0;'>Chúc bạn sẽ có kết quả tốt nhất trong buổi phỏng vấn sắp tới.</p>
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
        public async Task<bool> EvaluateCandidateAsync(EvaluationRequest request)
        {
            var interview = (await _interviewRepository.GetByCandidateIdAsync(request.CandidateID))
                            .OrderByDescending(i => i.InterviewDate)
                            .FirstOrDefault();

            if (interview == null) return false;

            // Gán dữ liệu đánh giá mới
            interview.Score = request.Score;
            interview.Comments = request.Comment;
            interview.Result = request.FinalDecision; // PASS hoặc FAIL

            await _interviewRepository.UpdateAsync(interview);

            // Cập nhật trạng thái ứng viên dựa trên quyết định
            string newStatus = request.FinalDecision == "PASS" ? "Passed" : "Fail";
            await _candidateRepository.UpdateStatusAsync(request.CandidateID, newStatus);

            return true;
        }

        public async Task<bool> SendFailEmailAsync(int candidateId)
        {
            // 1. Lấy ứng viên kèm theo thông tin Job để có Title gửi Email
            var candidates = await _candidateRepository.GetAllWithJobAsync();
            var candidate = candidates.FirstOrDefault(c => c.CandidateID == candidateId);

            // 2. Kiểm tra điều kiện gửi:
            // - Candidate phải tồn tại
            // - Trạng thái phải là "Fail" (So sánh không phân biệt hoa thường và xóa khoảng trắng thừa)
            // - Email này chưa được gửi trước đó
            if (candidate == null ||
                !candidate.Status.Trim().Equals("Fail", StringComparison.OrdinalIgnoreCase) ||
                candidate.IsFailEmailSent)
            {
                _logger.LogWarning($"Yêu cầu gửi email thất bại: CandidateID {candidateId} không đủ điều kiện (Status: {candidate?.Status}, Sent: {candidate?.IsFailEmailSent})");
                return false;
            }

            // 3. Chuẩn bị nội dung Email
            string jobTitle = candidate.JobPosting?.Title ?? "vị trí đã ứng tuyển";
            string subject = $"[HRM System] Thông báo kết quả phỏng vấn - Vị trí {jobTitle}";

            // Giao diện Email chuyên nghiệp
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
            Lời đầu tiên, đội ngũ tuyển dụng <strong>HRM System</strong> xin cảm ơn bạn đã dành thời gian và tâm huyết quan tâm đến vị trí <strong>{jobTitle}</strong>.
        </p>

        <p>
            Sau khi cân nhắc kỹ lưỡng dựa trên kết quả phỏng vấn và các yêu cầu chuyên môn hiện tại, chúng tôi rất tiếc phải thông báo rằng bạn chưa phù hợp để đi tiếp cùng công ty trong đợt tuyển dụng này.
        </p>

        <div style='background-color: #f8fafc; border-left: 4px solid #154398; padding: 15px; margin: 20px 0;'>
            <p style='margin: 0; font-style: italic; color: #555;'>
                ""Hồ sơ của bạn vẫn sẽ được chúng tôi lưu giữ trong kho dữ liệu tài năng. Chúng tôi sẽ chủ động liên hệ ngay khi có vị trí mới phù hợp với kỹ năng và định hướng nghề nghiệp của bạn.""
            </p>
        </div>

        <p>
            Một lần nữa, cảm ơn bạn về buổi trao đổi vừa qua. Hy vọng sẽ có cơ hội được hợp tác với bạn trong những dự án tương lai. Chúc bạn luôn gặt hái được nhiều thành công trên con đường sự nghiệp.
        </p>

        <p style='margin-top: 30px;'>Trân trọng,</p>
        <p><strong>Ban Tuyển dụng HRM System</strong></p>
    </div>
    
    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;'>
        <p style='margin: 5px 0;'>Đây là email tự động từ hệ thống quản trị nhân sự HRM.</p>
        <p style='margin: 5px 0;'>Vui lòng không phản hồi trực tiếp vào email này.</p>
    </div>
</div>";

            try
            {
                // 4. Thực hiện gửi Email qua Service
                await _emailService.SendEmailAsync(candidate.Email, subject, emailBody);

                // 5. Cập nhật trạng thái vào Database để tránh gửi lặp lại
                candidate.IsFailEmailSent = true;
                candidate.UpdatedAt = DateTime.Now;
                await _candidateRepository.UpdateAsync(candidate);

                _logger.LogInformation($"Đã gửi email thông báo trượt cho ứng viên ID: {candidateId} thành công.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi nghiêm trọng khi gửi email cho ứng viên ID: {candidateId}");
                return false;
            }
        }
        public async Task<bool> CreateOfferAsync(CreateOfferRequest request)

        {

            var candidate = await _candidateRepository.GetByIdAsync(request.CandidateID);

            if (candidate == null) throw new Exception("Không tìm thấy thông tin ứng viên.");



            var job = candidate.JobPosting;

            if (job != null && job.SalaryMin.HasValue && request.BasicSalary < job.SalaryMin.Value)

            {

                throw new Exception($"Mức lương offer ({request.BasicSalary:N0}) thấp hơn lương tối thiểu của vị trí này ({job.SalaryMin.Value:N0}).");

            }

            if (request.BasicSalary <= 0) throw new Exception("Mức lương offer phải lớn hơn 0.");



            var offer = new Offer

            {

                CandidateID = request.CandidateID,

                OfferedSalary = request.BasicSalary,

                JoinDate = request.JoinDate,

                Note = request.Note,

                OfferStatus = "Pending",

                OfferedDate = DateTime.Now,

                OfferAllowances = request.AllowanceIds?.Select(id => new OfferAllowance { ComponentID = id }).ToList() ?? new List<OfferAllowance>()

            };



            try

            {

                await _offerRepository.AddAsync(offer);



                string jobTitle = job?.Title ?? "Vị trí ứng tuyển";

                string subject = $"[HRM System] THƯ MỜI LÀM VIỆC - VỊ TRÍ {jobTitle.ToUpper()}";



                string emailBody = $@"

<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;'>

    <div style='background-color: #154398; padding: 25px; text-align: center;'>

        <h2 style='color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px;'>THƯ MỜI LÀM VIỆC</h2>

    </div>

    <div style='padding: 30px; background-color: #ffffff;'>

        <p style='font-size: 16px;'>Chào <strong>{candidate.FullName}</strong>,</p>

        <p>Chúc mừng bạn! Sau quá trình phỏng vấn ấn tượng, <strong>HRM System</strong> trân trọng mời bạn gia nhập đội ngũ của chúng tôi.</p>

        <div style='background-color: #f8fafc; border-left: 4px solid #154398; padding: 20px; margin: 25px 0;'>

            <p style='margin: 5px 0;'><strong>💼 Vị trí:</strong> {jobTitle}</p>

            <p style='margin: 5px 0;'><strong>💰 Mức lương:</strong> {request.BasicSalary:N0} VNĐ</p>

            <p style='margin: 5px 0;'><strong>📅 Ngày bắt đầu dự kiến:</strong> {request.JoinDate:dd/MM/yyyy}</p>

        </div>

        <p>Ghi chú từ bộ phận nhân sự: <em>{request.Note ?? "Bạn vui lòng đọc kĩ lời đề nghị hợp tác của chúng tôi."}</em></p>

        <p>Vui lòng phản hồi email này để xác nhận việc chấp thuận lời mời. Chúng tôi rất mong được gặp bạn vào ngày nhận việc!</p>

        <p style='margin-top: 30px;'>Trân trọng,<br><strong>Phòng Nhân sự HRM System</strong></p>

    </div>

    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;'>

        <p style='margin: 5px 0;'>Vui lòng phản hồi sớm nhất có thể. Nếu sau ba ngày kể từ khi email này được gửi mà bạn không có phản hồi thì chúng tôi xin phép bạn nhường cơ hội làm việc cho các ứng viên khác.</p>

    </div>

</div>";



                await _emailService.SendEmailAsync(candidate.Email, subject, emailBody);



                offer.OfferStatus = "Sent";

                await _offerRepository.UpdateAsync(offer);

                await _candidateRepository.UpdateStatusAsync(request.CandidateID, "Offered");



                return true;

            }

            catch (Exception ex)

            {

                _logger.LogError(ex, $"Lỗi quy trình Offer ứng viên {request.CandidateID}");

                return false;

            }

        }
        // --- TRƯỜNG HỢP 1: XÁC NHẬN TRÚNG TUYỂN (HIRED) ---
        public async Task<bool> ConfirmHireAsync(int candidateId)
        {
            var candidate = await _candidateRepository.GetByIdAsync(candidateId);
            if (candidate == null) return false;

            // 1. Cập nhật trạng thái ứng viên
            await _candidateRepository.UpdateStatusAsync(candidateId, "Hired");

            // 2. Cập nhật Offer cuối cùng thành Accepted
            var offer = (await _offerRepository.GetOffersByCandidateIdAsync(candidateId))
                        .OrderByDescending(o => o.OfferedDate)
                        .FirstOrDefault();

            if (offer != null)
            {
                offer.OfferStatus = "Accepted";
                offer.ResponseDate = DateTime.Now;
                await _offerRepository.UpdateAsync(offer);
            }

            // 3. Cập nhật số lượng đã tuyển trong JobPosting
            if (candidate.JobID > 0)
            {
                await _jobService.UpdateHiredCountAsync(candidate.JobID);
            }

            return true;
        }

        // --- TRƯỜNG HỢP 2: ỨNG VIÊN TỪ CHỐI OFFER ---
        public async Task<bool> DeclineOfferAsync(int candidateId, string reason)
        {
            var candidate = await _candidateRepository.GetByIdAsync(candidateId);
            if (candidate == null) return false;

            // 1. Cập nhật trạng thái ứng viên thành Declined (do từ chối offer)
            await _candidateRepository.UpdateStatusAsync(candidateId, "Declined");

            // 2. Cập nhật Offer cuối cùng thành Declined
            var offer = (await _offerRepository.GetOffersByCandidateIdAsync(candidateId))
                        .OrderByDescending(o => o.OfferedDate)
                        .FirstOrDefault();

            if (offer != null)
            {
                offer.OfferStatus = "Declined"; 
                offer.ResponseDate = DateTime.Now;
                offer.Note = string.IsNullOrEmpty(reason)
                             ? offer.Note
                             : $"{offer.Note} | Lý do từ chối: {reason}";

                await _offerRepository.UpdateAsync(offer);
            }

            return true;
        }
    }
}