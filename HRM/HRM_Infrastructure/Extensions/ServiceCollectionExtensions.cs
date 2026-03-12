using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.Contracts.Services;
using HRM_Application.Services;
using HRM_Application.Services;
using HRM_Application.Services.PayRoll;
using HRM_Application.Services.Recruitment;
using HRM_Application.Services.TimeAttendance;
using HRM_Infrastructure.BackgroundServices;
using HRM_Infrastructure.Data;
using HRM_Infrastructure.PayRoll.Repositories;
// using HRM_Application.Contracts.Services; // Uncomment nếu IGoalService nằm ở đây
using HRM_Infrastructure.Repositories.GoalService; // Nơi chứa class GoalService
using HRM_Infrastructure.Repositories.Payroll;
using HRM_Infrastructure.Repositories.PayRoll;
using HRM_Infrastructure.Repositories.PerformanceGoal;
using HRM_Infrastructure.Repositories.Recruitment;
using HRM_Infrastructure.Repositories.TimeAttendance;
using HRM_Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using HRM_Application.Services;
using HRM_Infrastructure.Repositories.TimeAttendance;
using HRM_Application.Contracts.Services;
using HRM_Application.Services.TimeAttendance;
using HRM_Application.Services.PayRoll;
using HRM_Infrastructure.Repositories.Payroll;
using HRM_Infrastructure.Repositories.PayRoll;
using HRM_Infrastructure.PayRoll.Repositories;
using HRM_Infrastructure.Repositories;
using HRM_Application.Interfaces.Repositories;
using HRM_Application.Interfaces.Services;

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
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPerformanceGoalRepository, PerformanceGoalRepository>();
            services.AddScoped<IJobPostingRepository, JobPostingRepository>();
            services.AddScoped<JobPostingService>();
            services.AddScoped<IAttendanceRepository, AttendanceRepository>();
            services.AddScoped<ICandidateRepository, CandidateRepository>();
            // services.AddScoped<IShiftRepository, ShiftRepository>(); 
            services.AddScoped<IEmployeeSalaryConfigRepository, EmployeeSalaryConfigRepository>();
            services.AddScoped<IEmployeeSalaryConfigService, EmployeeSalaryConfigService>();
            services.AddScoped<IEmployeeRepository, EmployeeRepository>();
            services.AddScoped<IPayrollRepository, PayrollRepository>();
            services.AddScoped<IPayrollService, PayrollService>();
            services.AddScoped<IMonthlyTimesheetService, MonthlyTimesheetService>();
            services.AddScoped<IMonthlyTimesheetRepository, MonthlyTimesheetRepository>();
            services.AddScoped<ICandidateRepository, CandidateRepository>();
            services.AddScoped<ICandidateService, CandidateService>();
            services.AddScoped<ISalaryAdvanceRepository, SalaryAdvanceRepository>();
            services.AddScoped<ISalaryAdvanceService, SalaryAdvanceService>();
            // 4. SERVICES (Business Logic Layer)
            // Đăng ký Service GoalService vào đây
            services.AddScoped<ICandidateService, CandidateService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IGoalService, GoalService>();
            services.AddHostedService<JobExpirationWorker>();
            services.AddScoped<IAttendanceService, AttendanceService>();
            services.AddScoped<IAttendanceExplanationRepository, AttendanceExplanationRepository>();
            services.AddScoped<IAttendanceExplanationService, AttendanceExplanationService>();
            services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
            services.AddScoped<ILeaveService, LeaveService>();
            services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
            services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();

            return services;
        }
    }
}