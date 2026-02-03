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
                .ForMember(dest => dest.MorningStart, opt => opt.MapFrom(src => TimeSpan.Parse(src.MorningStart)))
                .ForMember(dest => dest.AfternoonEnd, opt => opt.MapFrom(src => TimeSpan.Parse(src.AfternoonEnd)));
            CreateMap<ShiftConfig, ShiftResponse>()
                .ForMember(dest => dest.MorningStart, opt => opt.MapFrom(src => src.MorningStart.ToString(@"hh\:mm")))
                .ForMember(dest => dest.AfternoonEnd, opt => opt.MapFrom(src => src.AfternoonEnd.ToString(@"hh\:mm")));
        }
    }
}
