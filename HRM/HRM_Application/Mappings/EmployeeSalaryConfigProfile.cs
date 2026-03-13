using AutoMapper;
using HRM_Application.DTOs.EmployeeSalaryConfig;
using HRM_Application.DTOs.PayRoll;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Mappings
{
    public class EmployeeSalaryConfigProfile : Profile
    {
        public EmployeeSalaryConfigProfile()
        {
            // Map từ Entity -> DTO (Lấy thêm thông tin từ Navigation Property)
            CreateMap<EmployeeSalaryConfig, EmployeeSalaryConfigDTO>()
                .ForMember(dest => dest.ComponentName, opt => opt.MapFrom(src => src.SalaryComponent != null ? src.SalaryComponent.ComponentName : ""))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.SalaryComponent != null ? src.SalaryComponent.Type : ""));

            // Map từ DTO -> Entity
            CreateMap<AssignSalaryConfigDTO, EmployeeSalaryConfig>();
            CreateMap<MonthlyPayroll, PayrollDTO>();
        }
    }
}
