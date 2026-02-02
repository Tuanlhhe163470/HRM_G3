using HRM_Domain.Entities.TimeAttendance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Data
{
    public class HRMDbContext : DbContext
    {
        public HRMDbContext(DbContextOptions<HRMDbContext> options) : base(options)
        {
        }
        public DbSet<ShiftConfig> ShiftConfigs { get; set; }
    }
}
