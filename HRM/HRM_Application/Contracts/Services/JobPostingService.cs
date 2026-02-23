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
            job.ClosingDate = DateTime.Now;
            job.Status = "Closed";
            await _jobRepo.UpdateAsync(job);
            return true;
        }

        // 3. Mở lại tin (Reopen)
        public async Task<bool> ReopenJobPostingAsync(int jobId, DateTime newExpiryDate)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // 1. Kiểm tra tồn tại và trạng thái (Chỉ cho phép mở lại khi đã Closed)
            if (job == null || job.Status != "Closed") return false;

            // 2. CHECK LOGIC: Thời gian hết hạn mới phải lớn hơn thời gian hiện tại
            if (newExpiryDate <= DateTime.Now)
            {
                // Bạn có thể quăng một Exception hoặc trả về false tùy cấu trúc dự án
                return false;
            }

            // 3. Thực hiện cập nhật
            job.Status = "Open";
            job.ExpiryDate = newExpiryDate; // Gán ngày hết hạn mới do người dùng nhập
            job.UpdatedAt = DateTime.Now;
            job.ClosingDate = null; // Reset lại ngày đóng vì tin đã mở lại

            await _jobRepo.UpdateAsync(job);
            return true;
        }

        //Cập nhật
        public async Task<bool> UpdateJobPostingAsync(int jobId, JobPosting updatedData)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);

            // Kiểm tra tồn tại
            if (job == null) return false;

            // LOGIC QUAN TRỌNG: Nếu đã Closed thì không cho sửa
            if (job.Status == "Closed")
            {
                return false;
            }

            // Cập nhật các thông tin cho phép sửa
            job.Title = updatedData.Title;
            job.Description = updatedData.Description;
            job.DepartmentID = updatedData.DepartmentID;
            job.PositionID = updatedData.PositionID;
            job.ExpiryDate = updatedData.ExpiryDate;

            // Ghi nhận thời điểm cập nhật 
            job.UpdatedAt = DateTime.Now;

            await _jobRepo.UpdateAsync(job);
            return true;
        }
    }
}
