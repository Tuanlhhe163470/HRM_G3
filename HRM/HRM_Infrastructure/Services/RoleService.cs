using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Authentication;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Services
{
    public class RoleService : IRoleService
    {
        private readonly HRMDbContext _context;

        public RoleService(HRMDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoleResponse>> GetAllRolesAsync()
        {
            return await _context.Roles
                .Select(r => new RoleResponse
                {
                    RoleID = r.RoleID,
                    RoleName = r.RoleName
                })
                .ToListAsync();
        }
    }
}