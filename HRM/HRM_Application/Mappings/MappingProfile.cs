// File: HRM_Application/Mappings/MappingProfile.cs
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

            // Mapping cho UC: Ứng lương (SalaryAdvance -> SalaryAdvanceDTO)
            // AutoMapper tự map các field cùng tên: AdvanceID, Amount, Reason, RequestDate, Status, ApprovalDate, ManagerNote
            CreateMap<SalaryAdvance, SalaryAdvanceDTO>();

            // 2. Mapping cho UC2: Cấu hình lương (EmployeeSalaryConfig -> EmployeeSalaryConfigDTO)
            CreateMap<EmployeeSalaryConfig, EmployeeSalaryConfigDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src =>
                    src.Employee != null ? src.Employee.FullName : "N/A"))
                .ForMember(dest => dest.ComponentName, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.ComponentName : string.Empty))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src =>
                    src.SalaryComponent != null ? src.SalaryComponent.Type : string.Empty));

            CreateMap<Position, PositionResponse>();
            CreateMap<CreatePositionRequest, Position>();
            CreateMap<UpdatePositionRequest, Position>();

            CreateMap<Employee, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.EmployeeID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName));
            CreateMap<Department, DepartmentResponse>();
            CreateMap<CreateDepartmentRequest, Department>();
            CreateMap<UpdateDepartmentRequest, Department>();

            CreateMap<Position, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PositionID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PositionName));

            CreateMap<Department, BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.DepartmentID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.DepartmentName));

            CreateMap<CreateEmployeeRequest, Employee>();
            CreateMap<UpdateEmployeeRequest, Employee>();

            CreateMap<Employee, EmployeeResponse>()
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position))
                .ForMember(dest => dest.Manager, opt => opt.MapFrom(src => src.Manager));
            CreateMap<CreateLaborContractRequest, LaborContract>();
            CreateMap<UpdateLaborContractRequest, LaborContract>();

            CreateMap<LaborContract, DTOs.LaborContract.Responses.LaborContractResponse>()
                .ForMember(dest => dest.Employee, opt => opt.MapFrom(src => src.Employee));
            CreateMap<HRM_Domain.Entities.LeaveBalance, DTOs.LeaveBalance.Responses.LeaveBalanceResponse>()
                .ForMember(dest => dest.Employee, opt => opt.MapFrom(src => src.Employee))
                .ForMember(dest => dest.LeaveType, opt => opt.MapFrom(src => src.LeaveType));

            CreateMap<HRM_Domain.Entities.LeaveType, HRM_Application.DTOs.Commons.BaseReferenceResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));

            CreateMap<HRM_Domain.Entities.LeaveBalance, HRM_Application.DTOs.LeaveBalance.Responses.LeaveBalanceResponse>()
                .ForMember(dest => dest.Employee, opt => opt.MapFrom(src => src.Employee))
                .ForMember(dest => dest.LeaveType, opt => opt.MapFrom(src => src.LeaveType));

            CreateMap<CreateOvertimeRequestDto, OvertimeRequest>();

            CreateMap<OvertimeRequest, OvertimeRequestHistoryDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : "Unknown"));
        }

    }
}