using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    CandidateID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CVUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.CandidateID);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ManagerID = table.Column<int>(type: "int", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.DepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                columns: table => new
                {
                    PositionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PositionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BaseSalaryRange = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.PositionID);
                });

            migrationBuilder.CreateTable(
                name: "PublicHolidays",
                columns: table => new
                {
                    HolidayID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HolidayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicHolidays", x => x.HolidayID);
                });

            migrationBuilder.CreateTable(
                name: "ReviewCycles",
                columns: table => new
                {
                    CycleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CycleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewCycles", x => x.CycleID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "SalaryComponents",
                columns: table => new
                {
                    ComponentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComponentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsFixed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalaryComponents", x => x.ComponentID);
                });

            migrationBuilder.CreateTable(
                name: "ShiftConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShiftName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MorningStart = table.Column<TimeSpan>(type: "time", nullable: false),
                    AfternoonEnd = table.Column<TimeSpan>(type: "time", nullable: false),
                    AllowedLateMinutes = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingCourses",
                columns: table => new
                {
                    CourseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ThumbnailURL = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingCourses", x => x.CourseID);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    EmployeeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AvatarURL = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    PositionID = table.Column<int>(type: "int", nullable: true),
                    ManagerID = table.Column<int>(type: "int", nullable: true),
                    JoinDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.EmployeeID);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID");
                    table.ForeignKey(
                        name: "FK_Employees_Employees_ManagerID",
                        column: x => x.ManagerID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Positions_PositionID",
                        column: x => x.PositionID,
                        principalTable: "Positions",
                        principalColumn: "PositionID");
                });

            migrationBuilder.CreateTable(
                name: "AttendanceLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ShiftId = table.Column<int>(type: "int", nullable: false),
                    WorkDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckInTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    CheckOutTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    WorkingHours = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceLogs_ShiftConfigs_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "ShiftConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseMaterials",
                columns: table => new
                {
                    MaterialID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseMaterials", x => x.MaterialID);
                    table.ForeignKey(
                        name: "FK_CourseMaterials_TrainingCourses_CourseID",
                        column: x => x.CourseID,
                        principalTable: "TrainingCourses",
                        principalColumn: "CourseID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseQuestions",
                columns: table => new
                {
                    QuestionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseID = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OptionA = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionB = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionC = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionD = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CorrectOption = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseQuestions", x => x.QuestionID);
                    table.ForeignKey(
                        name: "FK_CourseQuestions_TrainingCourses_CourseID",
                        column: x => x.CourseID,
                        principalTable: "TrainingCourses",
                        principalColumn: "CourseID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobHistories",
                columns: table => new
                {
                    JobHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    OldDepartmentID = table.Column<int>(type: "int", nullable: true),
                    NewDepartmentID = table.Column<int>(type: "int", nullable: true),
                    OldPositionID = table.Column<int>(type: "int", nullable: true),
                    NewPositionID = table.Column<int>(type: "int", nullable: true),
                    ChangeDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobHistories", x => x.JobHistoryID);
                    table.ForeignKey(
                        name: "FK_JobHistories_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobPostings",
                columns: table => new
                {
                    JobID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    PositionID = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPostings", x => x.JobID);
                    table.ForeignKey(
                        name: "FK_JobPostings_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID");
                    table.ForeignKey(
                        name: "FK_JobPostings_Employees_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID");
                    table.ForeignKey(
                        name: "FK_JobPostings_Positions_PositionID",
                        column: x => x.PositionID,
                        principalTable: "Positions",
                        principalColumn: "PositionID");
                });

            migrationBuilder.CreateTable(
                name: "LaborContracts",
                columns: table => new
                {
                    ContractID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BaseSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SignedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaborContracts", x => x.ContractID);
                    table.ForeignKey(
                        name: "FK_LaborContracts_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyTimesheets",
                columns: table => new
                {
                    TimesheetID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    TotalWorkDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLateMinutes = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastCalculatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LockedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyTimesheets", x => x.TimesheetID);
                    table.ForeignKey(
                        name: "FK_MonthlyTimesheets_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceGoals",
                columns: table => new
                {
                    GoalID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CycleID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Weight = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ManagerComment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceGoals", x => x.GoalID);
                    table.ForeignKey(
                        name: "FK_PerformanceGoals_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PerformanceGoals_ReviewCycles_CycleID",
                        column: x => x.CycleID,
                        principalTable: "ReviewCycles",
                        principalColumn: "CycleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Requests",
                columns: table => new
                {
                    RequestID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ManagerVerifierID = table.Column<int>(type: "int", nullable: true),
                    ManagerVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HRApproverID = table.Column<int>(type: "int", nullable: true),
                    HRApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrentStep = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requests", x => x.RequestID);
                    table.ForeignKey(
                        name: "FK_Requests_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Requests_Employees_HRApproverID",
                        column: x => x.HRApproverID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID");
                    table.ForeignKey(
                        name: "FK_Requests_Employees_ManagerVerifierID",
                        column: x => x.ManagerVerifierID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    ReviewID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CycleID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ManagerID = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinalScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Rank = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    GeneralComment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FinalizedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK_Reviews_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Employees_ManagerID",
                        column: x => x.ManagerID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID");
                    table.ForeignKey(
                        name: "FK_Reviews_ReviewCycles_CycleID",
                        column: x => x.CycleID,
                        principalTable: "ReviewCycles",
                        principalColumn: "CycleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    AccountID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: true),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.AccountID);
                    table.ForeignKey(
                        name: "FK_UserAccounts_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAccounts_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    ApplicationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateID = table.Column<int>(type: "int", nullable: false),
                    JobID = table.Column<int>(type: "int", nullable: false),
                    CurrentStage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinalStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.ApplicationID);
                    table.ForeignKey(
                        name: "FK_Applications_Candidates_CandidateID",
                        column: x => x.CandidateID,
                        principalTable: "Candidates",
                        principalColumn: "CandidateID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Applications_JobPostings_JobID",
                        column: x => x.JobID,
                        principalTable: "JobPostings",
                        principalColumn: "JobID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyPayrolls",
                columns: table => new
                {
                    PayrollID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    TimesheetID = table.Column<long>(type: "bigint", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    BaseSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StandardWorkDays = table.Column<int>(type: "int", nullable: false),
                    ActualWorkDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalaryPerDay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAllowance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalNetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyPayrolls", x => x.PayrollID);
                    table.ForeignKey(
                        name: "FK_MonthlyPayrolls_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyPayrolls_MonthlyTimesheets_TimesheetID",
                        column: x => x.TimesheetID,
                        principalTable: "MonthlyTimesheets",
                        principalColumn: "TimesheetID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReviewDetails",
                columns: table => new
                {
                    DetailID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReviewID = table.Column<long>(type: "bigint", nullable: false),
                    GoalID = table.Column<long>(type: "bigint", nullable: false),
                    SelfScore = table.Column<int>(type: "int", nullable: true),
                    SelfComment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ManagerScore = table.Column<int>(type: "int", nullable: true),
                    ManagerComment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewDetails", x => x.DetailID);
                    table.ForeignKey(
                        name: "FK_ReviewDetails_PerformanceGoals_GoalID",
                        column: x => x.GoalID,
                        principalTable: "PerformanceGoals",
                        principalColumn: "GoalID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReviewDetails_Reviews_ReviewID",
                        column: x => x.ReviewID,
                        principalTable: "Reviews",
                        principalColumn: "ReviewID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTrainings",
                columns: table => new
                {
                    RecordID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CourseID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ProgressPercent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    QuizScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CertificateUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedByReviewID = table.Column<long>(type: "bigint", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTrainings", x => x.RecordID);
                    table.ForeignKey(
                        name: "FK_UserTrainings_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTrainings_Reviews_AssignedByReviewID",
                        column: x => x.AssignedByReviewID,
                        principalTable: "Reviews",
                        principalColumn: "ReviewID");
                    table.ForeignKey(
                        name: "FK_UserTrainings_TrainingCourses_CourseID",
                        column: x => x.CourseID,
                        principalTable: "TrainingCourses",
                        principalColumn: "CourseID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceLogHistories",
                columns: table => new
                {
                    HistoryID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LogID = table.Column<int>(type: "int", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    OldStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NewStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceLogHistories", x => x.HistoryID);
                    table.ForeignKey(
                        name: "FK_AttendanceLogHistories_AttendanceLogs_LogID",
                        column: x => x.LogID,
                        principalTable: "AttendanceLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttendanceLogHistories_UserAccounts_ModifiedBy",
                        column: x => x.ModifiedBy,
                        principalTable: "UserAccounts",
                        principalColumn: "AccountID");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_UserAccounts_UserID",
                        column: x => x.UserID,
                        principalTable: "UserAccounts",
                        principalColumn: "AccountID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    InterviewID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationID = table.Column<int>(type: "int", nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InterviewerID = table.Column<int>(type: "int", nullable: true),
                    Result = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviews", x => x.InterviewID);
                    table.ForeignKey(
                        name: "FK_Interviews_Applications_ApplicationID",
                        column: x => x.ApplicationID,
                        principalTable: "Applications",
                        principalColumn: "ApplicationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interviews_Employees_InterviewerID",
                        column: x => x.InterviewerID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID");
                });

            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    OfferID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationID = table.Column<int>(type: "int", nullable: false),
                    OfferedSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OfferStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OfferedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.OfferID);
                    table.ForeignKey(
                        name: "FK_Offers_Applications_ApplicationID",
                        column: x => x.ApplicationID,
                        principalTable: "Applications",
                        principalColumn: "ApplicationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScreeningResults",
                columns: table => new
                {
                    ScreeningID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationID = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MatchedSkills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResultSuggest = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ScreenedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScreeningResults", x => x.ScreeningID);
                    table.ForeignKey(
                        name: "FK_ScreeningResults_Applications_ApplicationID",
                        column: x => x.ApplicationID,
                        principalTable: "Applications",
                        principalColumn: "ApplicationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeSalaryDetails",
                columns: table => new
                {
                    DetailID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayrollID = table.Column<long>(type: "bigint", nullable: false),
                    ComponentID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSalaryDetails", x => x.DetailID);
                    table.ForeignKey(
                        name: "FK_EmployeeSalaryDetails_MonthlyPayrolls_PayrollID",
                        column: x => x.PayrollID,
                        principalTable: "MonthlyPayrolls",
                        principalColumn: "PayrollID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeSalaryDetails_SalaryComponents_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "SalaryComponents",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateID",
                table: "Applications",
                column: "CandidateID");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobID",
                table: "Applications",
                column: "JobID");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLogHistories_LogID",
                table: "AttendanceLogHistories",
                column: "LogID");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLogHistories_ModifiedBy",
                table: "AttendanceLogHistories",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLogs_ShiftId",
                table: "AttendanceLogs",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseMaterials_CourseID",
                table: "CourseMaterials",
                column: "CourseID");

            migrationBuilder.CreateIndex(
                name: "IX_CourseQuestions_CourseID",
                table: "CourseQuestions",
                column: "CourseID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentID",
                table: "Employees",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerID",
                table: "Employees",
                column: "ManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PositionID",
                table: "Employees",
                column: "PositionID");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSalaryDetails_ComponentID",
                table: "EmployeeSalaryDetails",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSalaryDetails_PayrollID",
                table: "EmployeeSalaryDetails",
                column: "PayrollID");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationID",
                table: "Interviews",
                column: "ApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_InterviewerID",
                table: "Interviews",
                column: "InterviewerID");

            migrationBuilder.CreateIndex(
                name: "IX_JobHistories_EmployeeID",
                table: "JobHistories",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_CreatedBy",
                table: "JobPostings",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_DepartmentID",
                table: "JobPostings",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_PositionID",
                table: "JobPostings",
                column: "PositionID");

            migrationBuilder.CreateIndex(
                name: "IX_LaborContracts_EmployeeID",
                table: "LaborContracts",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPayrolls_EmployeeID",
                table: "MonthlyPayrolls",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPayrolls_TimesheetID",
                table: "MonthlyPayrolls",
                column: "TimesheetID");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyTimesheets_EmployeeID",
                table: "MonthlyTimesheets",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_ApplicationID",
                table: "Offers",
                column: "ApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceGoals_CycleID",
                table: "PerformanceGoals",
                column: "CycleID");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceGoals_EmployeeID",
                table: "PerformanceGoals",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_EmployeeID",
                table: "Requests",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_HRApproverID",
                table: "Requests",
                column: "HRApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_ManagerVerifierID",
                table: "Requests",
                column: "ManagerVerifierID");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewDetails_GoalID",
                table: "ReviewDetails",
                column: "GoalID");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewDetails_ReviewID",
                table: "ReviewDetails",
                column: "ReviewID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CycleID",
                table: "Reviews",
                column: "CycleID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_EmployeeID",
                table: "Reviews",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ManagerID",
                table: "Reviews",
                column: "ManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_ScreeningResults_ApplicationID",
                table: "ScreeningResults",
                column: "ApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_EmployeeID",
                table: "UserAccounts",
                column: "EmployeeID",
                unique: true,
                filter: "[EmployeeID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_RoleID",
                table: "UserAccounts",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_AssignedByReviewID",
                table: "UserTrainings",
                column: "AssignedByReviewID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_CourseID",
                table: "UserTrainings",
                column: "CourseID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_EmployeeID",
                table: "UserTrainings",
                column: "EmployeeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceLogHistories");

            migrationBuilder.DropTable(
                name: "CourseMaterials");

            migrationBuilder.DropTable(
                name: "CourseQuestions");

            migrationBuilder.DropTable(
                name: "EmployeeSalaryDetails");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "JobHistories");

            migrationBuilder.DropTable(
                name: "LaborContracts");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Offers");

            migrationBuilder.DropTable(
                name: "PublicHolidays");

            migrationBuilder.DropTable(
                name: "Requests");

            migrationBuilder.DropTable(
                name: "ReviewDetails");

            migrationBuilder.DropTable(
                name: "ScreeningResults");

            migrationBuilder.DropTable(
                name: "UserTrainings");

            migrationBuilder.DropTable(
                name: "AttendanceLogs");

            migrationBuilder.DropTable(
                name: "MonthlyPayrolls");

            migrationBuilder.DropTable(
                name: "SalaryComponents");

            migrationBuilder.DropTable(
                name: "UserAccounts");

            migrationBuilder.DropTable(
                name: "PerformanceGoals");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "TrainingCourses");

            migrationBuilder.DropTable(
                name: "ShiftConfigs");

            migrationBuilder.DropTable(
                name: "MonthlyTimesheets");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "JobPostings");

            migrationBuilder.DropTable(
                name: "ReviewCycles");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Positions");
        }
    }
}
