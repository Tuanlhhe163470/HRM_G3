using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PayRoll;
using HRM_Domain.Entities;
using AutoMapper;

namespace HRM_Application.Services.PayRoll
{
    public class PayrollService : IPayrollService
    {
        private readonly IPayrollRepository _payrollRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IEmployeeSalaryConfigRepository _configRepo;
        private readonly IMapper _mapper;

        public PayrollService(
            IPayrollRepository payrollRepo,
            IEmployeeRepository employeeRepo,
            IEmployeeSalaryConfigRepository configRepo,
            IMapper mapper)
        {
            _payrollRepo = payrollRepo;
            _employeeRepo = employeeRepo;
            _configRepo = configRepo;
            _mapper = mapper;
        }

        public async Task<bool> CalculateMonthlyPayrollAsync(int month, int year)
        {
            var employees = await _employeeRepo.GetAllEmployeesAsync();
            const int standardDays = 26;

            foreach (var emp in employees)
            {
                // Gọi đúng tên hàm: GetByEmployeeIdAsync
                var configs = await _configRepo.GetByEmployeeIdAsync(emp.EmployeeID);
                if (configs == null || !configs.Any()) continue;

                decimal income = configs.Where(c => c.SalaryComponent.Type == "Income").Sum(c => c.Amount);
                decimal deduction = configs.Where(c => c.SalaryComponent.Type == "Deduction").Sum(c => c.Amount);

                // Logic tính toán (Giữ nguyên yêu cầu của bạn)
                int actualDays = 24;
                double otHours = 10;
                decimal dailyRate = (income - deduction) / standardDays;
                decimal baseActual = dailyRate * actualDays;
                decimal otVal = (decimal)otHours * (dailyRate / 8) * 1.5m;

                var payroll = new Payroll
                {
                    EmployeeID = emp.EmployeeID,
                    Month = month,
                    Year = year,
                    NetSalary = baseActual + otVal,
                    ComputedDate = DateTime.Now,
                    Status = "Pending"
                };
                await _payrollRepo.UpsertPayrollAsync(payroll);
            }
            return true;
        }

        public async Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year)
        {
            // Lấy dữ liệu từ Repo và dùng Mapper để chuyển sang DTO trả về cho Client
            var data = await _payrollRepo.GetMonthlyPayrollAsync(month, year);
            return _mapper.Map<IEnumerable<PayrollDTO>>(data);
        }
    }
}