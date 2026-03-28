using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Report;

namespace HRM_Application.Services.Report
{
    public class ReportService : IReportService
    {
        // Sử dụng Repo chuyên dụng thay vì Repo của Payroll
        private readonly IReportRepository _reportRepo;

        public ReportService(IReportRepository reportRepo)
        {
            _reportRepo = reportRepo;
        }

        public async Task<IEnumerable<InsuranceReportDTO>> GetInsuranceReportAsync(int month, int year)
        {
            var approvedPayrolls = await _reportRepo.GetApprovedPayrollsForReportAsync(month, year);

            return approvedPayrolls.Select(p => 
            {
                decimal salaryForBhxhBhyt = Math.Min(p.BaseSalary, 46800000m);
                decimal salaryForBhtn = Math.Min(p.BaseSalary, 99200000m);

                return new InsuranceReportDTO
                {
                    EmployeeID = p.Employee?.EmployeeID.ToString() ?? "N/A",
                    FullName = p.Employee?.FullName ?? "Unknown",
                    DepartmentName = p.Employee?.Department?.DepartmentName ?? "Chưa phân bổ",
                    BaseSalary = p.BaseSalary,

                    // NLĐ đóng (10.5% max)
                    EmpBHXH = salaryForBhxhBhyt * 0.08m,
                    EmpBHYT = salaryForBhxhBhyt * 0.015m,
                    EmpBHTN = salaryForBhtn * 0.01m,
                    TotalEmpPay = (salaryForBhxhBhyt * 0.095m) + (salaryForBhtn * 0.01m),

                    // Công ty đóng (21.5% max)
                    CompBHXH = salaryForBhxhBhyt * 0.175m,
                    CompBHYT = salaryForBhxhBhyt * 0.03m,
                    CompBHTN = salaryForBhtn * 0.01m,
                    TotalCompPay = (salaryForBhxhBhyt * 0.205m) + (salaryForBhtn * 0.01m)
                };
            });
        }

        public async Task<IEnumerable<TaxReportDTO>> GetTaxReportAsync(int month, int year)
        {
            var approvedPayrolls = await _reportRepo.GetApprovedPayrollsForReportAsync(month, year);

            return approvedPayrolls.Select(p =>
            {
                decimal bonus = p.AdjustmentAmount > 0 ? p.AdjustmentAmount : 0;
                decimal totalIncome = p.BaseSalary + p.TotalAllowance + bonus;
                
                decimal salaryForBhxhBhyt = Math.Min(p.BaseSalary, 46800000m);
                decimal salaryForBhtn = Math.Min(p.BaseSalary, 99200000m);
                decimal insuranceDeduct = (salaryForBhxhBhyt * 0.095m) + (salaryForBhtn * 0.01m);
                
                decimal personalDeduct = 11000000m;

                decimal taxableIncome = totalIncome - insuranceDeduct - personalDeduct;
                if (taxableIncome < 0) taxableIncome = 0;

                return new TaxReportDTO
                {
                    EmployeeID = p.Employee?.EmployeeID.ToString() ?? "N/A",
                    FullName = p.Employee?.FullName ?? "Unknown",
                    DepartmentName = p.Employee?.Department?.DepartmentName ?? "Chưa phân bổ",
                    TotalIncome = totalIncome,
                    InsuranceDeduction = insuranceDeduct,
                    PersonalDeduction = personalDeduct,
                    TaxableIncome = taxableIncome,
                    PITAmount = CalculatePIT(taxableIncome)
                };
            });
        }

        private decimal CalculatePIT(decimal taxableIncome)
        {
            if (taxableIncome <= 0) return 0;
            if (taxableIncome <= 5000000) return taxableIncome * 0.05m;
            if (taxableIncome <= 10000000) return (taxableIncome * 0.10m) - 250000;
            if (taxableIncome <= 18000000) return (taxableIncome * 0.15m) - 750000;
            if (taxableIncome <= 32000000) return (taxableIncome * 0.20m) - 1650000;
            if (taxableIncome <= 52000000) return (taxableIncome * 0.25m) - 3250000;
            if (taxableIncome <= 80000000) return (taxableIncome * 0.30m) - 5850000;
            return (taxableIncome * 0.35m) - 9850000;
        }
    }
}