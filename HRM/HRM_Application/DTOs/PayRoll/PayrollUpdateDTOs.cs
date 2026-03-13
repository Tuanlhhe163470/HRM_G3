using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PayRoll
{
    public class AdjustPayrollRequest
    {
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ApprovalRequest
    {
        public bool IsApproved { get; set; }
        public int ManagerId { get; set; }
    }
}
