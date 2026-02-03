using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.Data
{
    public class HRMDbContext : DbContext
    {
        public HRMDbContext(DbContextOptions<HRMDbContext> options) : base(options)
        {
        }

        // ================= 1. SYSTEM MODULE =================
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        // ================= 2. HR CORE MODULE =================
        public DbSet<Department> Departments { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<LaborContract> LaborContracts { get; set; }
        public DbSet<JobHistory> JobHistories { get; set; }

        // ================= 3. RECRUITMENT MODULE =================
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<JobPosting> JobPostings { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<ScreeningResult> ScreeningResults { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<Offer> Offers { get; set; }

        // ================= 4. TIME ATTENDANCE MODULE =================
        public DbSet<ShiftConfig> ShiftConfigs { get; set; }
        public DbSet<AttendanceLog> AttendanceLogs { get; set; }
        public DbSet<AttendanceLogHistory> AttendanceLogHistories { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<MonthlyTimesheet> MonthlyTimesheets { get; set; }
        public DbSet<PublicHoliday> PublicHolidays { get; set; }

        // ================= 5. PAYROLL MODULE =================
        public DbSet<MonthlyPayroll> MonthlyPayrolls { get; set; }
        public DbSet<SalaryComponent> SalaryComponents { get; set; }
        public DbSet<EmployeeSalaryDetail> EmployeeSalaryDetails { get; set; }

        // ================= 6. TRAINING MODULE =================
        public DbSet<ReviewCycle> ReviewCycles { get; set; }
        public DbSet<PerformanceGoal> PerformanceGoals { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewDetail> ReviewDetails { get; set; }
        public DbSet<TrainingCourse> TrainingCourses { get; set; }
        public DbSet<CourseMaterial> CourseMaterials { get; set; }
        public DbSet<CourseQuestion> CourseQuestions { get; set; }
        public DbSet<UserTraining> UserTrainings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Cấu hình nâng cao (Fluent API) ---

            // 1. Cấu hình quan hệ 1-1 giữa Employee và UserAccount
            modelBuilder.Entity<UserAccount>()
                .HasOne(u => u.Employee)
                .WithOne()
                .HasForeignKey<UserAccount>(u => u.EmployeeID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // 2. Cấu hình quan hệ Self-Referencing (Nhân viên - Quản lý)
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Manager)
                .WithMany()
                .HasForeignKey(e => e.ManagerID)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================================================
            // QUAN TRỌNG: FIX LỖI 1785 (CYCLES OR MULTIPLE CASCADE PATHS)
            // ==========================================================

            // Tắt Cascade Delete cho MonthlyPayroll khi xóa Timesheet
            modelBuilder.Entity<MonthlyPayroll>()
                .HasOne(p => p.Timesheet)
                .WithMany()
                .HasForeignKey(p => p.TimesheetID)
                .OnDelete(DeleteBehavior.Restrict); // Bắt buộc dùng Restrict

            // Tắt Cascade Delete cho MonthlyPayroll khi xóa Employee
            modelBuilder.Entity<MonthlyPayroll>()
                .HasOne(p => p.Employee)
                .WithMany()
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict); // Bắt buộc dùng Restrict

            // Tắt Cascade Delete cho Salary Details (Tùy chọn, nhưng an toàn hơn)
            modelBuilder.Entity<EmployeeSalaryDetail>()
                .HasOne(d => d.MonthlyPayroll)
                .WithMany()
                .HasForeignKey(d => d.PayrollID)
                .OnDelete(DeleteBehavior.Cascade); // Chi tiết thì xóa theo Payroll được

            // ==========================================================

            modelBuilder.Entity<ReviewDetail>(entity =>
            {
                // Cấu hình mối quan hệ với Review: Tắt Cascade Delete
                entity.HasOne(d => d.Review)
                      .WithMany() // Nếu bên Review có List<ReviewDetail> thì điền vào: .WithMany(r => r.ReviewDetails)
                      .HasForeignKey(d => d.ReviewID)
                      .OnDelete(DeleteBehavior.Restrict); // <-- QUAN TRỌNG: Đổi thành Restrict
            });

            // 3. Tự động set kiểu decimal(18,2) cho tất cả các trường tiền tệ
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var properties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(decimal) || p.PropertyType == typeof(decimal?));

                foreach (var property in properties)
                {
                    modelBuilder.Entity(entityType.Name)
                        .Property(property.Name)
                        .HasColumnType("decimal(18,2)");
                }
            }
        }
    }
}