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
    }
}
