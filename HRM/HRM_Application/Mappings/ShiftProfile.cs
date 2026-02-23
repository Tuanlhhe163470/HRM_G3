using HRM_Application.DTOs.Shift.Requests;
using HRM_Application.DTOs.Shift.Responses;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace HRM_Application.Mappings
{
    public class ShiftProfile : Profile
    {
        public ShiftProfile() 
        {
            CreateMap<CreateShiftRequest, ShiftConfig>()
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => TimeSpan.Parse(src.StartTime)))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => TimeSpan.Parse(src.EndTime)))
                .ForMember(dest => dest.WorkDays, opt => opt.MapFrom(src =>
                src.WorkDays != null && src.WorkDays.Any()
                ? string.Join(",", src.WorkDays.Distinct().OrderBy(d => d))
                : "1, 2, 3, 4, 5"));
            CreateMap<ShiftConfig, ShiftResponse>()
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime.ToString(@"hh\:mm")))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime.ToString(@"hh\:mm")))
                .ForMember(dest => dest.WorkDays, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.WorkDays)
                ? new List<int>()
                : src.WorkDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(int.Parse).ToList()));
        }
    }
}
