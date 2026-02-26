using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.Repositories.Recruitment
{
    public class JobPostingRepository : IJobPostingRepository
    {
        private readonly HRMDbContext _context;

        public JobPostingRepository(HRMDbContext context)
        {
            _context = context;
        }

        // CẬP NHẬT: Thêm Include để lấy kèm thông tin phòng ban/vị trí
        public async Task<JobPosting?> GetByIdAsync(int id)
        {
            return await _context.JobPostings
                .Include(j => j.Department)
                .Include(j => j.Position)
                .FirstOrDefaultAsync(j => j.JobID == id);
        }

        // CẬP NHẬT: Thêm Include cho hàm lấy theo trạng thái
        public async Task<IEnumerable<JobPosting>> GetByStatusAsync(string status)
        {
            return await _context.JobPostings
                .Where(j => j.Status == status)
                .Include(j => j.Department)
                .Include(j => j.Position)
                .ToListAsync();
        }

        // CẬP NHẬT: Thêm Include cho hàm lấy tất cả
        public async Task<IEnumerable<JobPosting>> GetAllAsync()
        {
            return await _context.JobPostings
                .Include(j => j.Department)
                .Include(j => j.Position)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }
        // CẬP NHẬT: Thêm Include cho hàm lấy theo phòng ban
        public async Task<IEnumerable<JobPosting>> GetByDepartmentAsync(int departmentId)
        {
            return await _context.JobPostings
                .Where(j => j.DepartmentID == departmentId)
                .Include(j => j.Department)
                .Include(j => j.Position)
                .ToListAsync();
        }

        // Các hàm bên dưới bạn đã có Include rồi nên giữ nguyên hoặc tối ưu thêm
        public async Task<IEnumerable<JobPosting>> GetAvailableJobsAsync()
        {
            return await _context.JobPostings
                .Where(j => j.Status == "Open")
                .Include(j => j.Department)
                .Include(j => j.Position)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(JobPosting job)
        {
            await _context.JobPostings.AddAsync(job);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(JobPosting job)
        {
            _context.JobPostings.Update(job);
            await _context.SaveChangesAsync();
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

        public async Task DeleteAsync(int id)
        {
            var job = await _context.JobPostings.FindAsync(id);
            if (job != null)
            {
                _context.JobPostings.Remove(job);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<JobPosting>> GetByStatusAndDeptAsync(string status, int deptId)
        {
            return await _context.JobPostings
                .Where(j => j.Status == status && j.DepartmentID == deptId)
                .Include(j => j.Department)
                .Include(j => j.Position)
                .Include(j => j.CreatedByUserAccount)
                    .ThenInclude(u => u.Employee)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobPosting>> GetAllWithDetailsAsync()
        {
            return await _context.JobPostings
                .Include(j => j.Department)
                .Include(j => j.Position)
                .Include(j => j.CreatedByUserAccount)
                    .ThenInclude(u => u.Employee)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }
    }
}