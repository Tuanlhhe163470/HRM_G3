using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IJobPostingRepository
    {
        // 1. Các phương thức CRUD cơ bản
        Task AddAsync(JobPosting job);
        Task<JobPosting?> GetByIdAsync(int id);
        Task UpdateAsync(JobPosting job);
        Task DeleteAsync(int id); // Mới: Hỗ trợ xóa yêu cầu lỗi
        Task<IEnumerable<JobPosting>> GetAvailableJobsAsync();
        // 2. Các phương thức truy vấn nâng cao

        Task<IEnumerable<JobPosting>> GetAllAsync(); // Mới: Xem tất cả tin/yêu cầu
        Task<IEnumerable<JobPosting>> GetByStatusAsync(string status);
        // Mới: Hỗ trợ Manager xem yêu cầu theo phòng ban (dữ liệu DeptID bạn đã có)
        Task<IEnumerable<JobPosting>> GetByDepartmentAsync(int departmentId);
        Task<IEnumerable<JobPosting>> GetByStatusAndDeptAsync(string status, int deptId);
        // 3. Xử lý logic nghiệp vụ tự động
        Task CloseExpiredJobsAsync();
    }
}