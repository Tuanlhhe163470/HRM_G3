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
    public class CandidateRepository : ICandidateRepository
    {
        private readonly HRMDbContext _context;
        public CandidateRepository(HRMDbContext context) => _context = context;

        public async Task<Candidate> AddAsync(Candidate candidate)
        {
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return candidate;
        }

        public async Task<Application> AddApplicationAsync(Application application)
        {
            _context.Applications.Add(application);
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task<Candidate?> GetByEmailAsync(string email)
        {
            return await _context.Candidates.FirstOrDefaultAsync(c => c.Email == email);
        }
        public async Task<IEnumerable<Candidate>> GetAllWithJobAsync()
        {
            return await _context.Candidates
                .Include(c => c.JobPosting)
                .ThenInclude(j => j.Department)
                .Include(c => c.Interviews)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }
        public async Task UpdateAsync(Candidate candidate)
        {
            _context.Candidates.Update(candidate);
            await _context.SaveChangesAsync();
        }
        public async Task<Candidate> GetByIdAsync(int id)
        {
            return await _context.Candidates
                .Include(c => c.JobPosting)
                .Include(c => c.Interviews)
                .FirstOrDefaultAsync(c => c.CandidateID == id);
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null) return false;

            candidate.Status = status;
            candidate.UpdatedAt = DateTime.Now;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
