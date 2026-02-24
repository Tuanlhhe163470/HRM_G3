using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Enums
{
    public enum TimesheetStatus
    {
        Calculation_Pending = 1, // Đang chờ tính toán (Chưa có data)
        Draft = 2,               // Bản nháp (Đã tổng hợp số liệu, HR có thể tính lại nhiều lần)
        Locked = 3,              // Khóa sổ (Chốt công, cấm sửa đổi log chấm công của tháng này)
        Published = 4            // Công bố (Cho phép nhân viên xem trên Dashboard)
    }
}
