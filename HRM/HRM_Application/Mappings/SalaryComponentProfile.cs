using AutoMapper;
using HRM_Application.DTOs.PayRoll;
using HRM_Application.DTOs.PublicHoliday.Requests;
using HRM_Application.DTOs.PublicHoliday.Responses;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Mappings
{
    public class SalaryComponentProfile : Profile
    {
        public SalaryComponentProfile()
        {
            CreateMap<SalaryComponent, SalaryComponentDTO>().ReverseMap();
            CreateMap<CreateSalaryComponentDTO, SalaryComponent>();
            CreateMap<UpdateSalaryComponentDTO, SalaryComponent>();
        }
    }
}
