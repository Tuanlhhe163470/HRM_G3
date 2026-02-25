namespace HRM_Domain.Entities
{
    public class Payroll
    {
        public int PayrollID { get; set; }
        public int EmployeeID { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal ConfiguredIncome { get; set; }    // Thu nhập cố định (UC2)
        public decimal ConfiguredDeduction { get; set; } // Khấu trừ cố định (UC2)
        public int StandardWorkingDays { get; set; }     // Ngày công chuẩn (26)
        public int ActualWorkingDays { get; set; }       // Ngày làm thực tế
        public double OTHours { get; set; }              // Giờ tăng ca
        public decimal OTSalary { get; set; }            // Tiền tăng ca
        public decimal TotalIncome { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal NetSalary { get; set; }           // Thực nhận
        public DateTime ComputedDate { get; set; }
        public string Status { get; set; } = "Pending";
        public virtual Employee Employee { get; set; }
    }
}