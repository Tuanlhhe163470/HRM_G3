using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using Microsoft.EntityFrameworkCore;
using HRM_Infrastructure.Data; // Thư mục chứa DbContext của bạn

namespace HRM_Infrastructure.Repositories.Report
{
    public class ReportRepository : IReportRepository
    {
        private readonly HRMDbContext _context;

        public ReportRepository(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MonthlyPayroll>> GetApprovedPayrollsForReportAsync(int month, int year)
        {
            // Query tối ưu riêng cho Báo cáo
            return await _context.MonthlyPayrolls
                .Include(p => p.Employee)
                    .ThenInclude(e => e.Department) // Lấy luôn thông tin Phòng ban
                .Where(p => p.Month == month &&
                            p.Year == year) // Tạm thời bỏ lọc (p.Status.ToUpper() == "APPROVED" || p.Status.ToUpper() == "PAID") để hiển thị DRAFT cho việc test
                .AsNoTracking() // KHÔNG theo dõi thay đổi -> Tiết kiệm RAM, Query cực nhanh
                .ToListAsync();
        }
    }
}