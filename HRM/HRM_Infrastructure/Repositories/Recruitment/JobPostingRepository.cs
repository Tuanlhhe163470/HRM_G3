using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.Recruitment
{
    public class JobPostingRepository : IJobPostingRepository
    {
        private readonly HRMDbContext _context;

        public JobPostingRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(JobPosting job)
        {
            await _context.JobPostings.AddAsync(job); // Ánh xạ bảng JobPostings
            await _context.SaveChangesAsync();
        }

        public async Task<JobPosting?> GetByIdAsync(int id)
        {
            return await _context.JobPostings.FindAsync(id);
        }
    }
}
