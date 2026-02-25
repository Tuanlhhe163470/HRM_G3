using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PayRoll
{
    public class PayrollDTO
    {
        public int EmployeeID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal NetSalary { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
