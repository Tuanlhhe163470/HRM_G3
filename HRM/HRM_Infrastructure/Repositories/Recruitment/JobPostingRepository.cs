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
        public async Task CloseExpiredJobsAsync()
        {
            var expiredJobs = _context.JobPostings
                .Where(j => j.Status == "Open" && j.ExpiryDate < DateTime.Now);

            foreach (var job in expiredJobs)
            {
                job.Status = "Closed";
                job.UpdatedAt = DateTime.Now;
                job.ClosingDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();
        }
        // 1. Thực thi DeleteAsync
        public async Task DeleteAsync(int id)
        {
            var job = await _context.JobPostings.FindAsync(id);
            if (job != null)
            {
                _context.JobPostings.Remove(job);
                await _context.SaveChangesAsync();
            }
        }

        // 2. Thực thi GetAllAsync
        public async Task<IEnumerable<JobPosting>> GetAllAsync()
        {
            return await _context.JobPostings
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        // 3. Thực thi GetByDepartmentAsync (Dựa trên bảng SQL bạn đã cung cấp)
        public async Task<IEnumerable<JobPosting>> GetByDepartmentAsync(int departmentId)
        {
            return await _context.JobPostings
                .Where(j => j.DepartmentID == departmentId)
                .ToListAsync();
        }
        public async Task<IEnumerable<JobPosting>> GetAvailableJobsAsync()
        {
            return await _context.JobPostings
                .Where(j => j.Status == "Open" && j.HiredCount < j.Vacancies)
                .ToListAsync();
        }
    }
}
