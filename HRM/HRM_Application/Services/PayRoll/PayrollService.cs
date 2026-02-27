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

            foreach (var emp in employees)
            {
                // 1. Lấy dữ liệu công thực tế
                var timesheet = await _payrollRepo.GetTimesheetAsync(emp.EmployeeID, month, year);
                if (timesheet == null) continue;

                // 2. Lấy các khoản lương cấu hình (UC2)
                var configs = await _configRepo.GetByEmployeeIdAsync(emp.EmployeeID);

                decimal baseSalary = configs
                    .Where(c => c.SalaryComponent != null && c.SalaryComponent.ComponentName == "Base Salary")
                    .Sum(c => c.Amount);

                decimal totalAllowance = configs
                    .Where(c => c.SalaryComponent != null && c.SalaryComponent.Type == "Income" && c.SalaryComponent.ComponentName != "Base Salary")
                    .Sum(c => c.Amount);

                decimal totalDeduction = configs
                    .Where(c => c.SalaryComponent != null && c.SalaryComponent.Type == "Deduction")
                    .Sum(c => c.Amount);

                // 3. Tính toán theo trường mới trong MonthlyPayroll.cs
                decimal salaryPerDay = timesheet.StandardWorkDays > 0 ? (baseSalary / timesheet.StandardWorkDays) : 0;
                decimal netSalary = (salaryPerDay * timesheet.ActualWorkDays) + totalAllowance - totalDeduction;

                // 4. Map dữ liệu vào Entity MonthlyPayroll mới
                var payroll = new MonthlyPayroll
                {
                    EmployeeID = emp.EmployeeID,
                    TimesheetID = timesheet.TimesheetID,
                    Month = month,
                    Year = year,
                    BaseSalary = baseSalary,
                    StandardWorkDays = timesheet.StandardWorkDays,
                    ActualWorkDays = timesheet.ActualWorkDays,
                    SalaryPerDay = salaryPerDay,
                    TotalAllowance = totalAllowance,
                    TotalDeduction = totalDeduction,
                    FinalNetSalary = netSalary,
                    Status = "Draft" // Trạng thái mặc định
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

        // 1. UC: Draft Payroll Review (Dành cho HR)
        public async Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason)
        {
            await _payrollRepo.UpdateAdjustmentAsync(id, amount, reason);
            return true;
        }

        // UC: Payroll Approval
        public async Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved)
        {
            string status = isApproved ? "Approved" : "Rejected";
            await _payrollRepo.ApproveStatusAsync(id, status, managerId);
            return true;
        }
    }
}