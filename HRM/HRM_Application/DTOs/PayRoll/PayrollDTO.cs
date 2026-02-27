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

        // Thêm các trường này để Frontend không bị "undefined"
        public decimal BaseSalary { get; set; }
        public decimal ActualWorkDays { get; set; }
        public decimal StandardWorkDays { get; set; }
        public decimal TotalAllowance { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal FinalNetSalary { get; set; } // Map vào NetSalary ở FE

        public decimal AdjustmentAmount { get; set; }
        public string? AdjustmentReason { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
