using HRM_Application.DTOs.Recruitment;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface ICandidateService
    {
        Task<bool> ApplyJobAsync(ApplyJobRequest request);

        Task<IEnumerable<CandidateDto>> GetCandidatesForAdminAsync(string role, int? departmentId);
        Task<bool> ProcessCandidateAsync(int id, string action);
    }
}
