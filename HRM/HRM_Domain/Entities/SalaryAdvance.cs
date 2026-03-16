using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class SalaryAdvance
    {

        [Key] // <--- ĐÁNH DẤU ĐÂY LÀ KHÓA CHÍNH
        public int AdvanceID { get; set; }

        public int EmployeeID { get; set; }

        public decimal Amount { get; set; }          // Số tiền muốn ứng
        public string Reason { get; set; } = string.Empty; // Lý do ứng

        public DateTime RequestDate { get; set; }    // Ngày nộp đơn
        public string Status { get; set; } = "Pending"; // Trạng thái

        public int? ApprovedBy { get; set; }         // ID của người duyệt
        public DateTime? ApprovalDate { get; set; }  // Ngày duyệt

        public virtual Employee Employee { get; set; }

        public string? ManagerNote { get; set; } // Lý do duyệt/từ chối

    }
}