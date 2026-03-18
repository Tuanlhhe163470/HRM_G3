using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.TimeAttendance
{
    public class CheckOutRequest
    {
        [MaxLength(50)]
        public string? CheckOutIp { get; set; }

        public string? Note { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
