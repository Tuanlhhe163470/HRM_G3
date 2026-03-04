// File: HRM_Application/Mappings/MappingProfile.cs
using AutoMapper;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using HRM_Application.DTOs.Goals;
using HRM_Application.DTOs.MonthlyTimesheet;
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
            // Map từ CreateGoalDTO (Input) sang PerformanceGoal (Entity)
            CreateMap<CreateGoalDTO, PerformanceGoal>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Draft")) // Mặc định là Draft
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now)); // Set ngày tạo

            CreateMap<AttendanceLog, AttendanceLogResponse>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.ShiftConfig != null ? src.ShiftConfig.ShiftName : "N/A"));

            CreateMap<MonthlyTimesheet, MonthlyTimesheetResponse>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))

                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "Unknown"))

                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src =>
                    (src.Employee != null && src.Employee.Department != null) ? src.Employee.Department.DepartmentName : "N/A"))

                .ForMember(dest => dest.PositionName, opt => opt.MapFrom(src =>
                    (src.Employee != null && src.Employee.Position != null) ? src.Employee.Position.PositionName : "N/A"));

            CreateMap<AttendanceExplanation, AttendanceExplanationResponse>()
               .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.AttendanceLog.Employee.FullName))
               .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AttendanceLog.Employee.AvatarURL))
               .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
               .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.AttendanceLog != null && src.AttendanceLog.ShiftConfig != null ? src.AttendanceLog.ShiftConfig.ShiftName : null))
               .ForMember(dest => dest.WorkDate, opt => opt.MapFrom(src => src.AttendanceLog != null ? src.AttendanceLog.WorkDate : (DateTime?)null));


            CreateMap<SubmitExplanationRequest, AttendanceExplanation>();
            CreateMap<Candidate, CandidateDto>()
     .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPosting.Title))
     .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentName))
     .ForMember(dest => dest.DepartmentID, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentID));

            CreateMap<MonthlyPayroll, PayrollDTO>()
               // Bổ sung Mapping ID để FE lấy được khóa chính gọi API duyệt & điều chỉnh
               .ForMember(dest => dest.PayrollID, opt => opt.MapFrom(src => src.PayrollID))
               // Lấy tên nhân viên
               .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : "N/A"))
               // Ánh xạ các trường tài chính để FE không hiện 0đ
               .ForMember(dest => dest.BaseSalary, opt => opt.MapFrom(src => src.BaseSalary))
               .ForMember(dest => dest.ActualWorkDays, opt => opt.MapFrom(src => src.ActualWorkDays))
               .ForMember(dest => dest.StandardWorkDays, opt => opt.MapFrom(src => src.StandardWorkDays))
               .ForMember(dest => dest.TotalAllowance, opt => opt.MapFrom(src => src.TotalAllowance))
               .ForMember(dest => dest.TotalDeduction, opt => opt.MapFrom(src => src.TotalDeduction))
               .ForMember(dest => dest.FinalNetSalary, opt => opt.MapFrom(src => src.FinalNetSalary));


            // 2. Mapping cho UC2: Cấu hình lương (EmployeeSalaryConfig -> EmployeeSalaryConfigDTO)
            CreateMap<EmployeeSalaryConfig, EmployeeSalaryConfigDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "N/A"))
                .ForMember(dest => dest.ComponentName, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.ComponentName : string.Empty)) // Khớp với ComponentName
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.Type : string.Empty));

            CreateMap<MonthlyPayroll, PayrollDTO>()
    // Bổ sung Mapping ID để FE lấy được khóa chính gọi API duyệt & điều chỉnh
    .ForMember(dest => dest.PayrollID, opt => opt.MapFrom(src => src.PayrollID))
    // Lấy tên nhân viên
    .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : "N/A"))
    // Ánh xạ các trường tài chính để FE không hiện 0đ
    .ForMember(dest => dest.BaseSalary, opt => opt.MapFrom(src => src.BaseSalary))
    .ForMember(dest => dest.ActualWorkDays, opt => opt.MapFrom(src => src.ActualWorkDays))
    .ForMember(dest => dest.StandardWorkDays, opt => opt.MapFrom(src => src.StandardWorkDays))
    .ForMember(dest => dest.TotalAllowance, opt => opt.MapFrom(src => src.TotalAllowance))
    .ForMember(dest => dest.TotalDeduction, opt => opt.MapFrom(src => src.TotalDeduction))
    .ForMember(dest => dest.FinalNetSalary, opt => opt.MapFrom(src => src.FinalNetSalary));

            // 2. Mapping cho UC2: Cấu hình lương (EmployeeSalaryConfig -> EmployeeSalaryConfigDTO)
            CreateMap<EmployeeSalaryConfig, EmployeeSalaryConfigDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "N/A"))
                .ForMember(dest => dest.ComponentName, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.ComponentName : string.Empty)) // Khớp với ComponentName
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.Type : string.Empty));
            CreateMap<Position, PositionResponse>();

            CreateMap<CreatePositionRequest, Position>();
            CreateMap<UpdatePositionRequest, Position>();
        }

    }
}