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
        private readonly ISalaryAdvanceRepository _advanceRepo;
        private readonly IOvertimeRequestRepository _otRepo;
        private readonly IMapper _mapper;

        public PayrollService(
            IPayrollRepository payrollRepo,
            IEmployeeRepository employeeRepo,
            IEmployeeSalaryConfigRepository configRepo,
            ISalaryAdvanceRepository advanceRepo,
            IOvertimeRequestRepository otRepo,
            IMapper mapper)
        {
            _payrollRepo = payrollRepo;
            _employeeRepo = employeeRepo;
            _configRepo = configRepo;
            _advanceRepo = advanceRepo;
            _otRepo = otRepo;
            _mapper = mapper;
        }

        public async Task<bool> CalculateMonthlyPayrollAsync(int month, int year)
        {
            var deadline = new DateTime(year, month, 1).AddMonths(1).AddDays(4); // Day 5 next month
            if (DateTime.Now.Date > deadline)
            {
                throw new InvalidOperationException($"Lương tháng {month}/{year} chỉ được tính hoặc điều chỉnh trước ngày {deadline:dd/MM/yyyy}.");
            }

            var employees = await _employeeRepo.GetAllEmployeesAsync();
            var approvedAdvances = await _advanceRepo.GetApprovedAdvancesByMonthAsync(month, year);
            var approvedOTs = await _otRepo.GetApprovedOTByMonthAsync(month, year);

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

                decimal empAdvances = approvedAdvances.Where(a => a.EmployeeID == emp.EmployeeID).Sum(a => a.Amount);
                decimal empOTHours = (decimal)approvedOTs.Where(o => o.EmployeeId == emp.EmployeeID).Sum(o => o.ApprovedHours);

                decimal salaryPerDay = timesheet.StandardWorkDays > 0 ? (baseSalary / timesheet.StandardWorkDays) : 0;
                decimal hourlyRate = salaryPerDay / 8m; // Assuming 8-hour workday
                decimal otPay = hourlyRate * 1.5m * empOTHours;

                totalAllowance += otPay;
                totalDeduction += empAdvances;

                // Cộng thêm PaidLeaveDays để tính lương thực tế
                decimal paidLeavePay = salaryPerDay * timesheet.PaidLeaveDays;
                decimal netSalary = (salaryPerDay * timesheet.ActualWorkDays) + paidLeavePay + totalAllowance - totalDeduction;

                var payroll = new MonthlyPayroll
                {
                    EmployeeID = emp.EmployeeID,
                    TimesheetID = timesheet.TimesheetID,
                    Month = month,
                    Year = year,
                    BaseSalary = baseSalary,
                    StandardWorkDays = timesheet.StandardWorkDays,
                    ActualWorkDays = timesheet.ActualWorkDays + timesheet.PaidLeaveDays, // Cập nhật hiển thị ngày công có lương
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

        public async Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year, int userId, string userRole)
        {
            var data = await _payrollRepo.GetMonthlyPayrollAsync(month, year, userId, userRole);
            var dtos = _mapper.Map<List<PayrollDTO>>(data);

            // 👉 ĐÃ THÊM: Gán tay DepartmentName và FullName để gửi sang Frontend (Dashboard)
            var dataList = data.ToList();
            for (int i = 0; i < dtos.Count; i++)
            {
                dtos[i].DepartmentName = dataList[i].Employee?.Department?.DepartmentName;

                // Đảm bảo FullName luôn có phòng trường hợp AutoMapper trượt
                if (string.IsNullOrEmpty(dtos[i].FullName))
                {
                    dtos[i].FullName = dataList[i].Employee?.FullName ?? "";
                }
            }

            return dtos;
        }

        private async Task CheckPayrollAdjustmentAllowedAsync(int payrollId, int managerId)
        {
            var manager = await _employeeRepo.GetEmployeeByIdAsync(managerId);
            var payroll = await _payrollRepo.GetByIdAsync(payrollId);

            if (manager == null || payroll == null) throw new KeyNotFoundException("Không tìm thấy dữ liệu.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(payroll.EmployeeID);

            if (employee == null || manager.DepartmentID != employee.DepartmentID)
            {
                throw new UnauthorizedAccessException("Bạn chỉ có thể thao tác với bảng lương của nhân viên thuộc bộ phận của mình.");
            }

            var deadline = new DateTime(payroll.Year, payroll.Month, 1).AddMonths(1).AddDays(4);
            if (DateTime.Now.Date > deadline)
            {
                throw new InvalidOperationException($"Lương tháng {payroll.Month}/{payroll.Year} chỉ được phép điều chỉnh trước ngày {deadline:dd/MM/yyyy}.");
            }
        }

        public async Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason, int managerId)
        {
            await CheckPayrollAdjustmentAllowedAsync(id, managerId);
            await _payrollRepo.UpdateAdjustmentAsync(id, amount, reason);
            return true;
        }

        // Cộng dồn thêm điều chỉnh (hỗ trợ nhiều lần thưởng/phạt)
        public async Task<bool> AddAdjustmentAsync(int id, decimal amount, string reason, int managerId)
        {
            await CheckPayrollAdjustmentAllowedAsync(id, managerId);
            await _payrollRepo.AddAdjustmentAsync(id, amount, reason);
            return true;
        }

        public async Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved)
        {
            var manager = await _employeeRepo.GetEmployeeByIdAsync(managerId);
            var payroll = await _payrollRepo.GetByIdAsync(id);

            if (manager == null || payroll == null) throw new KeyNotFoundException("Không tìm thấy dữ liệu.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(payroll.EmployeeID);

            if (employee == null || manager.DepartmentID != employee.DepartmentID)
            {
                throw new UnauthorizedAccessException("Bạn chỉ có thể thao tác với bảng lương của nhân viên thuộc bộ phận của mình.");
            }

            string status = isApproved ? "APPROVED" : "REJECTED"; // Cập nhật IN HOA cho đồng bộ
            await _payrollRepo.ApproveStatusAsync(id, status, managerId);
            return true;
        }

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

            var dto = _mapper.Map<PayrollDTO>(payroll);

            // 👉 ĐÃ THÊM: Gán tay cho phiếu lương cá nhân
            dto.DepartmentName = payroll.Employee?.Department?.DepartmentName;
            if (string.IsNullOrEmpty(dto.FullName))
            {
                dto.FullName = payroll.Employee?.FullName ?? "";
            }

            // Truy vấn thêm dữ liệu OT và Ứng lương để chi tiết hóa phiếu lương
            var approvedAdvances = await _advanceRepo.GetApprovedAdvancesByMonthAsync(month, year);
            dto.AdvanceDeduction = approvedAdvances.Where(a => a.EmployeeID == employeeId).Sum(a => a.Amount);

            var approvedOTs = await _otRepo.GetApprovedOTByMonthAsync(month, year);
            var empOTs = approvedOTs.Where(o => o.EmployeeId == employeeId).ToList();
            dto.OTHours = (decimal)empOTs.Sum(o => o.ApprovedHours);

            // Tính tiền OT
            if (payroll.StandardWorkDays > 0)
            {
                decimal salaryPerDay = payroll.BaseSalary / payroll.StandardWorkDays;
                decimal hourlyRate = salaryPerDay / 8m;
                dto.OTPay = hourlyRate * 1.5m * dto.OTHours;
            }

            dto.PaidLeaveDays = payroll.Timesheet?.PaidLeaveDays ?? 0;

            // Truy vấn chi tiết cấu hình lương để hiển thị minh bạch từng khoản
            var configs = await _configRepo.GetByEmployeeIdAsync(employeeId);

            dto.Allowances = configs
                .Where(c => c.SalaryComponent != null && c.SalaryComponent.Type == "Income" && c.SalaryComponent.ComponentName != "Base Salary")
                .Select(c => new SalaryComponentDetailDTO { ComponentName = c.SalaryComponent.ComponentName, Amount = c.Amount })
                .ToList();

            dto.Deductions = configs
                .Where(c => c.SalaryComponent != null && c.SalaryComponent.Type == "Deduction")
                .Select(c => new SalaryComponentDetailDTO { ComponentName = c.SalaryComponent.ComponentName, Amount = c.Amount })
                .ToList();

            return dto;
        }
    }
}