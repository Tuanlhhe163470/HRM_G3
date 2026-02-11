using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IJobPostingRepository
    {
        Task AddAsync(JobPosting job); //
        Task<JobPosting?> GetByIdAsync(int id);
        // Các phương thức hỗ trợ khác
    }
}
