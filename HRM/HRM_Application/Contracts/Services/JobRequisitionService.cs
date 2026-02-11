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

        public JobRequisitionService(IJobPostingRepository jobRepo)
        {
            _jobRepo = jobRepo;
        }

        // Thực thi Use Case: Create Job Requisition
        public async Task<JobPosting> CreateRequisitionAsync(JobPosting requisition)
        {
            // Thiết lập logic nghiệp vụ mặc định
            requisition.CreatedAt = DateTime.Now;
            requisition.Status = "Draft"; // Trạng thái ban đầu chờ duyệt

            await _jobRepo.AddAsync(requisition); //
            return requisition;
        }
    }
}
