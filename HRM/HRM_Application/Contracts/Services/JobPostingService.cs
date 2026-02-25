using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public class JobPostingService
    {
        private readonly IJobPostingRepository _jobRepo;
        public JobPostingService(IJobPostingRepository jobRepo) => _jobRepo = jobRepo;

        #region 1. QUY TRÌNH YÊU CẦU & PHÊ DUYỆT (REQUISITION)

        // Tạo yêu cầu tuyển dụng mới (Mặc định Status = Pending)
        public async Task<JobPosting> CreateJobRequestAsync(JobPosting jobRequest)
        {
            jobRequest.CreatedAt = DateTime.Now;
            // Ép trạng thái về Pending để chờ Manager phê duyệt
            jobRequest.Status = "Pending";
            jobRequest.CreatedAt = DateTime.Now;
            await _jobRepo.AddAsync(jobRequest);
            return jobRequest;
        }

        // Manager phê duyệt hoặc từ chối yêu cầu
        public async Task<bool> ApproveJobRequestAsync(int jobId, bool isApproved)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // Chỉ phê duyệt khi tin đang ở trạng thái chờ duyệt (Pending)
            if (job == null || job.Status != "Pending") return false;

            // Nếu Duyệt: Chuyển sang Approved (đã sẵn sàng để HR Public)
            // Nếu Từ chối: Chuyển sang Rejected
            job.Status = isApproved ? "Approved" : "Rejected";
            job.UpdatedAt = DateTime.Now;

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        #endregion

        #region 2. QUẢN LÝ TIN ĐĂNG CÔNG KHAI (POSTING)

        // HR đăng tin chính thức lên sàn (Public) sau khi đã được Approved
        public async Task<bool> PublishJobPostingAsync(int jobId, string finalDescription)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // Logic: Chỉ cho phép đăng tin nếu Manager đã phê duyệt (Approved)
            if (job == null || job.Status != "Approved") return false;

            job.Description = finalDescription;
            job.Status = "Open"; // Chính thức hiển thị cho ứng viên
            job.UpdatedAt = DateTime.Now;

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // Lấy danh sách tin đang mở (Dùng cho ứng viên hoặc trang chủ)
        public async Task<IEnumerable<JobPosting>> GetPublishedJobsAsync()
        {
            return await _jobRepo.GetByStatusAsync("Open");
        }

        // Cập nhật nội dung tin (Sửa JD, Tiêu đề...)
        public async Task<bool> UpdateJobPostingAsync(int jobId, JobPosting updatedData)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            if (job == null || job.Status == "Closed") return false;

            job.Title = updatedData.Title;
            job.Description = updatedData.Description;
            job.DepartmentID = updatedData.DepartmentID;
            job.PositionID = updatedData.PositionID;
            job.ExpiryDate = updatedData.ExpiryDate;
            job.UpdatedAt = DateTime.Now;

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // Đóng tin tuyển dụng (Dừng nhận hồ sơ)
        public async Task<bool> CloseJobPostingAsync(int jobId)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            if (job == null || job.Status != "Open") return false;

            job.ClosingDate = DateTime.Now;
            job.Status = "Closed";
            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // Mở lại tin (Gia hạn cho tin đã đóng)
        public async Task<bool> ReopenJobPostingAsync(int jobId, DateTime newExpiryDate)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            if (job == null || job.Status != "Closed" || newExpiryDate <= DateTime.Now)
                return false;

            job.Status = "Open";
            job.ExpiryDate = newExpiryDate;
            job.UpdatedAt = DateTime.Now;
            job.ClosingDate = null; // Reset ngày đóng

            await _jobRepo.UpdateAsync(job);
            return true;
        }
        // Hàm này sẽ được gọi mỗi khi có một ứng viên trúng tuyển (Hired)
        public async Task<bool> UpdateHiredCountAsync(int jobId)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            if (job == null) return false;

            // 1. Tăng số người đã tuyển lên 1
            job.HiredCount++;
            job.UpdatedAt = DateTime.Now;

            // 2. Kiểm tra nếu đã đủ người (HiredCount >= Vacancies)
            if (job.HiredCount >= job.Vacancies)
            {
                job.Status = "Closed";
                job.ClosingDate = DateTime.Now;
            }

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // Cập nhật lại hàm lấy tin cho ứng viên
        public async Task<IEnumerable<JobPosting>> GetAvailableJobsAsync()
        {
            return await _jobRepo.GetAvailableJobsAsync();
        }
        #endregion
    }
}