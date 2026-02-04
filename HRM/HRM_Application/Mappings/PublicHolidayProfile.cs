using AutoMapper;
using HRM_Application.DTOs.PublicHoliday.Requests;
using HRM_Application.DTOs.PublicHoliday.Responses;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using System;

namespace HRM_Application.Mappings
{
    public class PublicHolidayProfile : Profile
    {
        public PublicHolidayProfile()
        {
            CreateMap<CreatePublicHolidayRequest, PublicHoliday>();

            CreateMap<UpdatePublicHolidayRequest, PublicHoliday>();

            CreateMap<PublicHoliday, PublicHolidayResponse>();
        }
    }
}