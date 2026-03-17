using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PayRoll
{
    public class PayrollDTO
    {
        public int PayrollID { get; set; }
        public int EmployeeID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public string? DepartmentName { get; set; }

        // Thêm các trường này để Frontend không bị "undefined"
        public decimal BaseSalary { get; set; }
        public decimal ActualWorkDays { get; set; }
        public decimal StandardWorkDays { get; set; }
        public decimal PaidLeaveDays { get; set; } // Số ngày nghỉ có lương
        public decimal TotalAllowance { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal FinalNetSalary { get; set; } // Map vào NetSalary ở FE

        // Thêm chi tiết OT và Ứng lương
        public decimal OTHours { get; set; }
        public decimal OTPay { get; set; }
        public decimal AdvanceDeduction { get; set; }

        // Chi tiết từng khoản phụ cấp và khấu trừ
        public List<SalaryComponentDetailDTO> Allowances { get; set; } = new();
        public List<SalaryComponentDetailDTO> Deductions { get; set; } = new();

        public decimal AdjustmentAmount { get; set; }
        public string? AdjustmentReason { get; set; }

        public string Status { get; set; } = string.Empty;
    }

    public class EmployeePayrollDetailDTO
    {
        public int PayrollID { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal BaseSalary { get; set; }
        public decimal ActualWorkDays { get; set; }
        public decimal TotalAllowance { get; set; }
        public decimal TotalDeduction { get; set; }

        // Phần minh bạch thưởng phạt
        public decimal AdjustmentAmount { get; set; }
        public string? AdjustmentReason { get; set; }

        public decimal FinalNetSalary { get; set; }
        public string Status { get; set; }
    }

    public class SalaryComponentDetailDTO
    {
        public string ComponentName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
