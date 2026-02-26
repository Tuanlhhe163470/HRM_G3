using HRM_Application.DTOs.Recruitment;
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
    }
}
