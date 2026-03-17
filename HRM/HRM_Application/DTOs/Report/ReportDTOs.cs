using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Report
{
    public class InsuranceReportDTO
    {
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public decimal BaseSalary { get; set; } // Lương cơ bản (Lương đóng BH)

        // Cột người lao động đóng (10.5%)
        public decimal EmpBHXH { get; set; }
        public decimal EmpBHYT { get; set; }
        public decimal EmpBHTN { get; set; }
        public decimal TotalEmpPay { get; set; }

        // Cột doanh nghiệp đóng (21.5%)
        public decimal CompBHXH { get; set; }
        public decimal CompBHYT { get; set; }
        public decimal CompBHTN { get; set; }
        public decimal TotalCompPay { get; set; }
    }

    // DTO cho Báo cáo Thuế TNCN
    public class TaxReportDTO
    {
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; } // Tổng thu nhập trong tháng
        public decimal InsuranceDeduction { get; set; } // Các khoản trích BH trừ vào lương
        public decimal PersonalDeduction { get; set; } = 11000000; // Giảm trừ gia cảnh bản thân (Mặc định 11M)
        public decimal TaxableIncome { get; set; } // Thu nhập tính thuế
        public decimal PITAmount { get; set; } // Thuế TNCN (Personal Income Tax)
    }
}
