// File: HRM_Application/Mappings/MappingProfile.cs
using AutoMapper;
using HRM_Application.DTOs.Goals;
using HRM_Application.DTOs.MonthlyTimesheet;
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
            CreateMap<Candidate, CandidateDto>()
     .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPosting.Title))
     .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentName)) 
     .ForMember(dest => dest.DepartmentID, opt => opt.MapFrom(src => src.JobPosting.Department.DepartmentID)); 
        }

    }
}