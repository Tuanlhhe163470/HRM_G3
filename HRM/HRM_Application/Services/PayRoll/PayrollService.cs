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
                var timesheet = await _payrollRepo.GetTimesheetAsync(emp.EmployeeID, month, year);
                if (timesheet == null) continue;

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

                decimal salaryPerDay = timesheet.StandardWorkDays > 0 ? (baseSalary / timesheet.StandardWorkDays) : 0;
                decimal netSalary = (salaryPerDay * timesheet.ActualWorkDays) + totalAllowance - totalDeduction;

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
                    Status = "Draft"
                };

                await _payrollRepo.UpsertPayrollAsync(payroll);
            }
            return true;
        }

        public async Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year)
        {
            var data = await _payrollRepo.GetMonthlyPayrollAsync(month, year);
            return _mapper.Map<IEnumerable<PayrollDTO>>(data);
        }

        public async Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason)
        {
            await _payrollRepo.UpdateAdjustmentAsync(id, amount, reason);
            return true;
        }

        // Cộng dồn thêm điều chỉnh (hỗ trợ nhiều lần thưởng/phạt)
        public async Task<bool> AddAdjustmentAsync(int id, decimal amount, string reason)
        {
            await _payrollRepo.AddAdjustmentAsync(id, amount, reason);
            return true;
        }

        public async Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved)
        {
            string status = isApproved ? "APPROVED" : "REJECTED"; // Cập nhật IN HOA cho đồng bộ
            await _payrollRepo.ApproveStatusAsync(id, status, managerId);
            return true;
        }

        // ĐÃ SỬA: Trả về PayrollDTO và ép ToUpper() khi kiểm tra status
        public async Task<PayrollDTO?> GetPersonalPayrollAsync(int employeeId, int month, int year)
        {
            var payroll = await _payrollRepo.GetEmployeePayrollAsync(employeeId, month, year);

            if (payroll == null) return null;

            var status = payroll.Status?.ToUpper();
            // Hiển thị khi bảng lương đã được tính (Draft), duyệt (Approved) hoặc chi trả (Paid)
            if (status != "APPROVED" && status != "PAID" && status != "DRAFT")
            {
                return null;
            }

            return _mapper.Map<PayrollDTO>(payroll);
        }
    }
}