using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public class JobPostingService
    {
        private readonly IJobPostingRepository _jobRepo;
        public JobPostingService(IJobPostingRepository jobRepo) => _jobRepo = jobRepo;

        // 1. Đăng tin (Chỉ khi đã Approved)
        public async Task<bool> PublishJobPostingAsync(int jobId, string finalDescription)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            if (job == null || job.Status != "Approved") return false;

            job.Description = finalDescription;
            job.Status = "Open"; // Chính thức lên sàn
            job.UpdatedAt = DateTime.Now;
            await _jobRepo.UpdateAsync(job);
            return true;
        }

        //Lấy danh sách tin đăng đang mở
        public async Task<IEnumerable<JobPosting>> GetPublishedJobsAsync()
        {
            // Lọc các tin có trạng thái là "Open" để hiển thị cho ứng viên
            return await _jobRepo.GetByStatusAsync("Open");
        }

        // 2. Đóng tin (Dừng nhận hồ sơ)
        public async Task<bool> CloseJobPostingAsync(int jobId)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            if (job == null || job.Status != "Open") return false;

            job.Status = "Closed";
            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // 3. Mở lại tin (Reopen)
        public async Task<bool> ReopenJobPostingAsync(int jobId)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            // Chỉ mở lại khi đã đóng. 
            // Logic quan trọng: Nếu Requisition gốc bị Rejected thì không được Reopen.
            if (job == null || job.Status != "Closed") return false;

            job.Status = "Open";
            job.UpdatedAt = DateTime.Now;
            await _jobRepo.UpdateAsync(job);
            return true;
        }
    }
}
