using HRM_Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM_Domain.Entities
{

    public class MonthlyTimesheet
    {
        [Key]
        public int TimesheetID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        // =========================================================================
        // NHÓM 1: CÁC CHỈ SỐ NGÀY CÔNG (Dùng cho module Lương)
        // =========================================================================

        [Column(TypeName = "decimal(5,2)")]
        public decimal StandardWorkDays { get; set; } // Ngày công chuẩn (VD: Tháng 2 có 20 ngày)

        [Column(TypeName = "decimal(5,2)")]
        public decimal ActualWorkDays { get; set; } // Ngày đi làm thực tế

        [Column(TypeName = "decimal(5,2)")]
        public decimal PaidLeaveDays { get; set; } // Ngày nghỉ có lương (Nghỉ phép năm, Lễ tết)

        [Column(TypeName = "decimal(5,2)")]
        public decimal UnpaidLeaveDays { get; set; } // Ngày nghỉ không lương / Vắng mặt

        // =========================================================================
        // NHÓM 2: CÁC CHỈ SỐ THỜI GIAN CHI TIẾT
        // =========================================================================

        public double TotalWorkingHours { get; set; } // Tổng số giờ làm việc

        public double TotalOvertimeHours { get; set; } // Tổng giờ tăng ca (OT)

        public int TotalLateMinutes { get; set; } // Tổng phút đi muộn

        public int TotalEarlyLeaveMinutes { get; set; } // Tổng phút về sớm

        // =========================================================================
        // NHÓM 3: QUẢN LÝ TRẠNG THÁI & LƯU VẾT
        // =========================================================================

        public TimesheetStatus Status { get; set; } = TimesheetStatus.Calculation_Pending;

        public DateTime? LastCalculatedDate { get; set; } // Lần cuối chạy tool tổng hợp
        public DateTime? LockedDate { get; set; } // Thời điểm HR bấm nút "Khóa sổ"
        public DateTime? PublishedDate { get; set; } // Thời điểm gửi báo cáo cho nhân viên xem
    }
}