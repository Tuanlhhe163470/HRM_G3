// File: HRM_Application/Mappings/MappingProfile.cs
using AutoMapper;
using HRM_Application.DTOs.Goals;
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
        }
    }
}