using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Authentication; 
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly HRMDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(HRMDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Cập nhật kiểu trả về từ Task<string?> sang Task<LoginResponse?>
        public async Task<LoginResponse?> AuthenticateAsync(string username, string password)
        {
            // 1. Tìm user và nạp kèm Role + Thông tin Employee + Department + Position
            var user = await _context.UserAccounts
                .Include(u => u.Role)
                .Include(u => u.Employee)
                    .ThenInclude(e => e.Department)
                .Include(u => u.Employee)
                    .ThenInclude(e => e.Position)
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

            // Kiểm tra mật khẩu
            if (user == null || user.PasswordHash != password) return null;

            // 2. Logic tạo JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Employee"),
                    new Claim("EmployeeID", user.EmployeeID?.ToString() ?? ""),
                    new Claim("DepartmentId", user.Employee?.DepartmentID.ToString() ?? "0"),
                }),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:DurationInMinutes"]!)),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // 3. Trả về đối tượng LoginResponse chứa cả Token và Data nhân viên
            return new LoginResponse
            {
                Token = tokenString,
                Employee = new EmployeeLoginDto
                {
                    EmployeeID = user.Employee?.EmployeeID ?? 0,
                    RoleName = user.Role?.RoleName ?? "Employee",
                    FullName = user.Employee?.FullName ?? "N/A",
                    Email = user.Employee?.Email ?? "",
                    Gender = user.Employee?.Gender,
                    Phone = user.Employee?.Phone,
                    AvatarURL = user.Employee?.AvatarURL,
                    DepartmentName = user.Employee?.Department?.DepartmentName,
                    PositionName = user.Employee?.Position?.PositionName,
                    Status = user.Employee?.Status ?? "Active"
                }
            };
        }
    }
}