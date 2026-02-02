using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class UserAccount
    {
        [Key]
        public int AccountID { get; set; }

        public int? EmployeeID { get; set; }
        // Lưu ý: Sẽ cần cấu hình FluentAPI để xử lý quan hệ 1-1 nếu cần
        [ForeignKey("EmployeeID")]
        public virtual Employee? Employee { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        public int RoleID { get; set; }
        [ForeignKey("RoleID")]
        public virtual Role? Role { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime? LastLogin { get; set; }
    }
}
