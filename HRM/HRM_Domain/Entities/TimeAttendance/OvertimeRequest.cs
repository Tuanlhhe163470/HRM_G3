using HRM_Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM_Domain.Entities.TimeAttendance
{
    public class OvertimeRequest
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }

        public DateTime Date { get; set; } // Xin OT cho ngày nào
        public TimeSpan StartTime { get; set; } // Bắt đầu OT từ mấy giờ (VD: 17:30)
        public TimeSpan EndTime { get; set; } // Kết thúc OT lúc mấy giờ (VD: 19:30)

        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        // Luồng duyệt 2 cấp
        public int? ManagerId { get; set; }
        public int? HRAdminId { get; set; }

        public ExplanationStatus Status { get; set; } = ExplanationStatus.PendingManager;

        public string? ManagerNote { get; set; }
        public string? HRNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Số giờ OT THỰC TẾ được tính lương (Sẽ do hệ thống tự động tính toán khi HR duyệt đơn)
        public double ApprovedHours { get; set; } = 0;
    }
}