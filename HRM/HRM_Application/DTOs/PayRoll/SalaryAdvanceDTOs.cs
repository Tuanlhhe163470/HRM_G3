using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.PayRoll
{
    public class CreateSalaryAdvanceDTO
    {
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    // DTO để trả về lịch sử ứng lương cho nhân viên xem
    public class SalaryAdvanceDTO
    {
        public int AdvanceID { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? ManagerNote { get; set; }  // Ghi chú từ Manager khi duyệt/từ chối
    }

    // DTO cho Manager xem đơn đang chờ duyệt
    public class ManagerAdvanceDTO
    {
        public int AdvanceID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ManagerNote { get; set; }
        public DateTime? ApprovalDate { get; set; }
    }

    // DTO hứng dữ liệu khi Manager bấm nút Duyệt/Từ chối
    public class ProcessAdvanceRequestDTO
    {
        public bool IsApproved { get; set; }
        public string ManagerNote { get; set; } = string.Empty;
    }
}
