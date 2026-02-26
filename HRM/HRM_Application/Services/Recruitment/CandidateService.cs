using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Recruitment;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.Recruitment
{
    public class CandidateService : ICandidateService
    {
        private readonly ICandidateRepository _candidateRepo;

        public CandidateService(ICandidateRepository candidateRepo)
        {
            _candidateRepo = candidateRepo;
        }

        public async Task<bool> ApplyJobAsync(ApplyJobRequest request)
        {
            // 1. Kiểm tra ứng viên tồn tại chưa dựa trên Email
            var candidate = await _candidateRepo.GetByEmailAsync(request.Email);

            if (candidate == null)
            {
                candidate = new Candidate
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    Phone = request.Phone,
                    CVUrl = request.CVUrl,
                    Source = "Website"
                };
                candidate = await _candidateRepo.AddAsync(candidate);
            }

            // 2. Tạo đơn ứng tuyển (Theo Entity Application bạn gửi)
            var application = new Application
            {
                CandidateID = candidate.CandidateID,
                JobID = request.JobID,
                CurrentStage = "Applied", // Giá trị mặc định bạn đã set
                AppliedDate = DateTime.Now
            };

            await _candidateRepo.AddApplicationAsync(application);
            return true;
        }
    }
}
