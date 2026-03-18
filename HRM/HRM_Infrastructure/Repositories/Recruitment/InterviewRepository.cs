using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.Recruitment
{
    public class InterviewRepository : IInterviewRepository
    {
        private readonly HRMDbContext _context;

        public InterviewRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddAsync(Interview interview)
        {
            // Thêm bản ghi mới vào bảng dbo.Interviews
            await _context.Interviews.AddAsync(interview);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Interview?> GetByIdAsync(int id)
        {
            // Lấy thông tin phỏng vấn kèm theo thông tin ứng viên và người phỏng vấn
            return await _context.Interviews
                .Include(i => i.Candidate)
                .Include(i => i.Interviewer)
                .FirstOrDefaultAsync(i => i.InterviewID == id);
        }

        public async Task<IEnumerable<Interview>> GetByCandidateIdAsync(int candidateId)
        {
            // Lấy toàn bộ lịch sử phỏng vấn của một ứng viên
            return await _context.Interviews
                .Where(i => i.CandidateID == candidateId)
                .OrderByDescending(i => i.InterviewDate)
                .ToListAsync();
        }

        public async Task<bool> UpdateAsync(Interview interview)
        {
            // Cập nhật kết quả hoặc thông tin buổi phỏng vấn
            _context.Interviews.Update(interview);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Interview>> GetAllWithCandidateAsync()
        {
            // Sử dụng Eager Loading để lấy kèm thông tin ứng viên và vị trí ứng tuyển
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.JobPosting)
                .OrderByDescending(i => i.InterviewDate)
                .ToListAsync();
        }
    }
}