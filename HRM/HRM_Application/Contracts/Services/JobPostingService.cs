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

        public JobPostingService(IJobPostingRepository jobRepo)
        {
            _jobRepo = jobRepo;
        }

        /// <summary>
        /// Use Case: Create Job Posting
        /// Mô tả: HR cập nhật JD và chuyển trạng thái tin tuyển dụng sang Open
        /// </summary>
        public async Task<bool> PublishJobPostingAsync(int jobId, string finalDescription)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // Kiểm tra: Chỉ đăng tin nếu yêu cầu đã được Approved
            if (job == null || job.Status != "Approved") return false;

            // Cập nhật nội dung JD chi tiết và Candidate Requirements
            job.Description = finalDescription; //
            job.Status = "Open"; // Chuyển trạng thái để hiển thị lên website

            await _jobRepo.UpdateAsync(job);
            return true;
        }
        // Use Case: Update Job Posting
        public async Task<bool> UpdateJobPostingAsync(int jobId, JobPosting updatedData)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            if (job == null) return false;

            // Cập nhật các thông tin cho phép sửa
            job.Title = updatedData.Title;
            job.Description = updatedData.Description;
            job.DepartmentID = updatedData.DepartmentID;
            job.PositionID = updatedData.PositionID;

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // Use Case: Close Job Posting
        public async Task<bool> CloseJobPostingAsync(int jobId)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // Chỉ đóng những tin đang ở trạng thái Open
            if (job == null || job.Status != "Open") return false;

            job.Status = "Closed"; // Chuyển trạng thái để ẩn khỏi trang tuyển dụng

            await _jobRepo.UpdateAsync(job);
            return true;
        }
    }
}
