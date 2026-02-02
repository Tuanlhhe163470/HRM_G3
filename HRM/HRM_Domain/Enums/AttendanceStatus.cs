using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Enums
{
    public enum AttendanceStatus
    {
        OnTime = 1,    // Đi đúng giờ
        Late = 2,      // Đi muộn
        EarlyLeave = 3,// Về sớm
        Absent = 4,    // Vắng mặt
        Overtime = 5   // Làm thêm giờ
    }
}
