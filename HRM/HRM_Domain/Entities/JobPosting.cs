using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace HRM_Domain.Entities
{
    public class JobPosting
    {
        [Key]
        public int JobID { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public int? DepartmentID { get; set; }
        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }

        public int? PositionID { get; set; }
        [ForeignKey("PositionID")]
        public virtual Position? Position { get; set; }
        public int Vacancies { get; set; } = 1;
        public int HiredCount { get; set; } = 0;
        public string Description { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        [StringLength(50)]
        public string Status { get; set; } = "Draft"; // Mặc định là Draft cho Requisition nội bộ

        public int? CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual Employee? Creator { get; set; }

        // --- CÁC TRƯỜNG QUẢN LÝ THỜI GIAN ---

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; } // Sẽ cập nhật khi Approve, Publish hoặc Reopen

        public DateTime? ExpiryDate { get; set; } // Ngày hết hạn tin tuyển dụng dự kiến

        public DateTime? ClosingDate { get; set; } // Ngày thực tế đóng tin
        [ForeignKey("CreatedBy")]
        public virtual UserAccount? CreatedByUserAccount { get; set; }
    }
}