// File: HRM_Application/Mappings/MappingProfile.cs
using AutoMapper;
using HRM_Application.DTOs.Goals;
using HRM_Domain.Entities;

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
        }
    }
}