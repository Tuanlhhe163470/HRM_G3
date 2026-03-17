using AutoMapper;
using HRM_Application.DTOs.Commons;
using HRM_Application.DTOs.Department.Requests;
using HRM_Application.DTOs.Department.Responses;
using HRM_Application.DTOs.Employee;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using HRM_Application.DTOs.Goals;
using HRM_Application.DTOs.LaborContract;
using HRM_Application.DTOs.MonthlyTimesheet;
using HRM_Application.DTOs.Overtime;
using HRM_Application.DTOs.PayRoll;
using HRM_Application.DTOs.Positions;
using HRM_Application.DTOs.Recruitment;
using HRM_Application.DTOs.TimeAttendance;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;

namespace HRM_Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ================= GOAL =================
            CreateMap<CreateGoalDTO, PerformanceGoal>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Draft"))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now));

            // ================= ATTENDANCE =================
            CreateMap<AttendanceLog, AttendanceLogResponse>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src =>
                    src.ShiftConfig != null ? src.ShiftConfig.ShiftName : "N/A"));

            CreateMap<MonthlyTimesheet, MonthlyTimesheetResponse>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "Unknown"))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src =>
                    src.Employee != null && src.Employee.Department != null
                        ? src.Employee.Department.DepartmentName
                        : "N/A"))
                .ForMember(dest => dest.PositionName, opt => opt.MapFrom(src =>
                    src.Employee != null && src.Employee.Position != null
                        ? src.Employee.Position.PositionName
                        : "N/A"));

            CreateMap<AttendanceExplanation, AttendanceExplanationResponse>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.AttendanceLog.Employee.FullName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AttendanceLog.Employee.AvatarURL))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src =>
                    src.AttendanceLog != null && src.AttendanceLog.ShiftConfig != null
                        ? src.AttendanceLog.ShiftConfig.ShiftName
                        : null))
                .ForMember(dest => dest.WorkDate, opt => opt.MapFrom(src =>
                    src.AttendanceLog != null ? src.AttendanceLog.WorkDate : (DateTime?)null));

            CreateMap<SubmitExplanationRequest, AttendanceExplanation>();

            // ================= RECRUITMENT =================
            CreateMap<Candidate, CandidateDto>()
                .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPosting.Title))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentName))
                .ForMember(dest => dest.DepartmentID, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentID))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src =>
                    src.Interviews != null && src.Interviews.Any()
                        ? src.Interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault().Score
                        : (int?)null))
                .ForMember(dest => dest.Comments, opt => opt.MapFrom(src =>
                    src.Interviews != null && src.Interviews.Any()
                        ? src.Interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault().Comments
                        : null))
                .ForMember(dest => dest.InterviewDate, opt => opt.MapFrom(src =>
                    src.Interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault().InterviewDate))
                .ForMember(dest => dest.InterviewType, opt => opt.MapFrom(src =>
                    src.Interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault().InterviewType))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src =>
                    src.Interviews.OrderByDescending(i => i.InterviewDate).FirstOrDefault().Location));

            CreateMap<Interview, ScheduleInterviewDto>()
                .ForMember(dest => dest.CandidateName, opt => opt.MapFrom(src => src.Candidate.FullName))
                .ForMember(dest => dest.CandidatePhone, opt => opt.MapFrom(src => src.Candidate.Phone))
                .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Candidate.JobPosting.Title))
                .ForMember(dest => dest.DepartmentID, opt => opt.MapFrom(src => src.Candidate.JobPosting.DepartmentID));

            CreateMap<ScheduleInterviewDto, Interview>();

            // ================= PAYROLL =================
            CreateMap<MonthlyPayroll, PayrollDTO>()
                .ForMember(dest => dest.PayrollID, opt => opt.MapFrom(src => src.PayrollID))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "N/A"))
                .ForMember(dest => dest.BaseSalary, opt => opt.MapFrom(src => src.BaseSalary))
                .ForMember(dest => dest.ActualWorkDays, opt => opt.MapFrom(src => src.ActualWorkDays))
                .ForMember(dest => dest.StandardWorkDays, opt => opt.MapFrom(src => src.StandardWorkDays))
                .ForMember(dest => dest.TotalAllowance, opt => opt.MapFrom(src => src.TotalAllowance))
                .ForMember(dest => dest.TotalDeduction, opt => opt.MapFrom(src => src.TotalDeduction))
                .ForMember(dest => dest.FinalNetSalary, opt => opt.MapFrom(src => src.FinalNetSalary));

            CreateMap<SalaryAdvance, SalaryAdvanceDTO>();

            // ================= SALARY CONFIG =================
            CreateMap<EmployeeSalaryConfig, EmployeeSalaryConfigDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "N/A"))
                .ForMember(dest => dest.ComponentName, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.ComponentName : string.Empty))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.Type : string.Empty));

            // ================= POSITION =================
            CreateMap<Position, PositionResponse>();
            CreateMap<CreatePositionRequest, Position>();
            CreateMap<UpdatePositionRequest, Position>();

            CreateMap<Position, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PositionID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PositionName));

            // ================= DEPARTMENT =================
            CreateMap<Department, DepartmentResponse>();
            CreateMap<CreateDepartmentRequest, Department>();
            CreateMap<UpdateDepartmentRequest, Department>();

            CreateMap<Department, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.DepartmentID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.DepartmentName));

            // ================= EMPLOYEE =================
            CreateMap<CreateEmployeeRequest, Employee>();
            CreateMap<UpdateEmployeeRequest, Employee>();

            CreateMap<Employee, EmployeeResponse>()
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position))
                .ForMember(dest => dest.Manager, opt => opt.MapFrom(src => src.Manager));

            CreateMap<Employee, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.EmployeeID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName));
            // Map từ Candidate sang Employee khi HR nhấn "Confirm Hire"
            CreateMap<Candidate, Employee>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                // Cực kỳ quan trọng: Gán CandidateID để link dữ liệu sau này làm hợp đồng
                .ForMember(dest => dest.CandidateID, opt => opt.MapFrom(src => src.CandidateID))
                // Mặc định trạng thái khi mới tuyển vào
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Working"))
                // Lấy thông tin phòng ban và vị trí từ tin tuyển dụng
                .ForMember(dest => dest.DepartmentID, opt => opt.MapFrom(src => src.JobPosting.DepartmentID))
                .ForMember(dest => dest.PositionID, opt => opt.MapFrom(src => src.JobPosting.PositionID))
                .ForMember(dest => dest.JoinDate, opt => opt.Ignore()); // Sẽ gán từ ngày trong Offer

            // ================= CONTRACT =================
            CreateMap<CreateLaborContractRequest, LaborContract>();
            CreateMap<UpdateLaborContractRequest, LaborContract>();

            CreateMap<LaborContract, DTOs.LaborContract.Responses.LaborContractResponse>()
                .ForMember(dest => dest.Employee, opt => opt.MapFrom(src => src.Employee))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Employee.Department.DepartmentName));


            // ================= LEAVE =================
            CreateMap<LeaveType, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));

            CreateMap<LeaveBalance, DTOs.LeaveBalance.Responses.LeaveBalanceResponse>()
                .ForMember(dest => dest.Employee, opt => opt.MapFrom(src => src.Employee))
                .ForMember(dest => dest.LeaveType, opt => opt.MapFrom(src => src.LeaveType));

            // ================= OVERTIME =================
            CreateMap<CreateOvertimeRequestDto, OvertimeRequest>();

            CreateMap<OvertimeRequest, OvertimeRequestHistoryDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "Unknown"));
        }
    }
}