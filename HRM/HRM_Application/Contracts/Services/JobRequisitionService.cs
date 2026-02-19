using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public class JobRequisitionService
    {
        private readonly IJobPostingRepository _jobRepo;
        public JobRequisitionService(IJobPostingRepository jobRepo) => _jobRepo = jobRepo;

        // 1. Tạo yêu cầu tuyển dụng (Nội bộ)
        public async Task<JobPosting> CreateRequisitionAsync(JobPosting requisition)
        {
            requisition.CreatedAt = DateTime.Now;
            requisition.Status = "Draft";
            await _jobRepo.AddAsync(requisition);
            return requisition;
        }

        // 2. Manager phê duyệt/từ chối
        public async Task<bool> ApproveRequisitionAsync(int jobId, bool isApproved)
        {
            var job = await _jobRepo.GetByIdAsync(jobId);
            // Chỉ phê duyệt khi đang ở trạng thái Draft hoặc Pending
            if (job == null || (job.Status != "Draft" && job.Status != "Pending")) return false;

            job.Status = isApproved ? "Approved" : "Rejected";
            await _jobRepo.UpdateAsync(job);
            return true;
        }
    }
}
