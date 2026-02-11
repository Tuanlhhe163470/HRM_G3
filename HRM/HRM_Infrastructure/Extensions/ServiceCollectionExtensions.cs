using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.Services;
using HRM_Infrastructure.Data;
// using HRM_Application.Contracts.Services; // Uncomment nếu IGoalService nằm ở đây
using HRM_Infrastructure.Repositories.GoalService; // Nơi chứa class GoalService
using HRM_Infrastructure.Repositories.PerformanceGoal;
using HRM_Infrastructure.Repositories.Recruitment;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace HRM_Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // 1. DATABASE CONFIGURATION
            var connectionString = configuration.GetConnectionString("MyCon"); // Lưu ý: Tên chuỗi kết nối trong appsettings.json của bạn là "MyCon" hay "DefaultConnection"? Hãy kiểm tra lại nhé.

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("Connection string is not found.");

            services.AddDbContext<HRMDbContext>(options =>
                options.UseSqlServer(connectionString));

            // 2. AUTOMAPPER
            // Sửa lỗi cú pháp tại đây: Dùng AddAutoMapper thay vì MappingProfile
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // 3. REPOSITORIES (Data Access Layer)
            services.AddScoped<IPerformanceGoalRepository, PerformanceGoalRepository>();
            services.AddScoped<JobRequisitionService>();
            services.AddScoped<IJobPostingRepository, JobPostingRepository>();
            // services.AddScoped<IShiftRepository, ShiftRepository>(); 

            // 4. SERVICES (Business Logic Layer)
            // Đăng ký Service GoalService vào đây
            services.AddScoped<IGoalService, GoalService>();

            return services;
        }
    }
}