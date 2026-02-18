using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
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

        public async Task<IEnumerable<JobPosting>> GetByStatusAsync(string status)
        {
            return await _context.JobPostings
                .Where(j => j.Status == status)
                .ToListAsync();
        }
        public async Task AddAsync(JobPosting job)
        {
            await _context.JobPostings.AddAsync(job); 
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(JobPosting job)
        {
            _context.Entry(job).State = EntityState.Modified; 
            await _context.SaveChangesAsync();
        }
        public async Task<JobPosting?> GetByIdAsync(int id)
        {
            return await _context.JobPostings.FindAsync(id);
        }
    }
}
