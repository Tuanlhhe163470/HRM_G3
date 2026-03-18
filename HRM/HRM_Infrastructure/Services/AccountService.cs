using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Authentication;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRM_Domain.Entities;

namespace HRM_Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly HRMDbContext _context;

        public AccountService(HRMDbContext context)
        {
            _context = context;
        }

        // 1. Lấy tất cả tài khoản
        public async Task<IEnumerable<AccountResponseDto>> GetAllAccountsAsync()
        {
            return await _context.UserAccounts
                .Include(u => u.Employee)
                .Include(u => u.Role)
                .OrderByDescending(u => u.AccountID)
                .Select(u => new AccountResponseDto
                {
                    AccountID = u.AccountID,
                    EmployeeID = u.EmployeeID,
                    EmployeeName = u.Employee != null ? u.Employee.FullName : "N/A",
                    Username = u.Username,
                    RoleName = u.Role != null ? u.Role.RoleName : "No Role",
                    IsActive = u.IsActive,
                    LastLogin = u.LastLogin
                }).ToListAsync();
        }

        // 2. Lấy nhân viên chưa có tài khoản
        public async Task<IEnumerable<EmployeeAccountStatusDto>> GetEmployeesWithoutAccountAsync()
        {
            return await _context.Employees
                .Where(e => !_context.UserAccounts.Any(u => u.EmployeeID == e.EmployeeID))
                .OrderByDescending(e => e.EmployeeID)
                .Select(e => new EmployeeAccountStatusDto
                {
                    EmployeeID = e.EmployeeID,
                    FullName = e.FullName,
                    DepartmentName = e.Department != null ? e.Department.DepartmentName : "N/A"
                }).ToListAsync();
        }

        // 3. Tạo tài khoản mới
        public async Task<bool> CreateAccountAsync(CreateAccountRequest request)
        {
            var usernameExists = await _context.UserAccounts.AnyAsync(u => u.Username == request.Username);
            if (usernameExists) throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

            var newAccount = new UserAccount
            {
                EmployeeID = request.EmployeeID,
                Username = request.Username,
                PasswordHash = request.Password,
                RoleID = request.RoleID,
                IsActive = true // Mặc định là 1 khi tạo
            };

            _context.UserAccounts.Add(newAccount);
            return await _context.SaveChangesAsync() > 0;
        }

        // 4. Xóa tài khoản
        public async Task<bool> DeleteAccountAsync(int accountId, int currentAdminId)
        {
            if (accountId == currentAdminId)
                throw new InvalidOperationException("Bạn không thể tự xóa tài khoản của chính mình.");

            var account = await _context.UserAccounts.FindAsync(accountId);
            if (account == null) return false;

            _context.UserAccounts.Remove(account);
            return await _context.SaveChangesAsync() > 0;
        }

        // 5. Khóa hoặc Mở khóa tài khoản (Xử lý vi phạm)
        // Logic: Nếu đang 1 (Active) -> 0 (Locked). Nếu đang 0 (Locked) -> 1 (Active)
        public async Task<bool> ToggleStatusAsync(int accountId, int currentAdminId)
        {
            // Bảo vệ tài khoản Admin đang đăng nhập không bị tự khóa
            if (accountId == currentAdminId)
                throw new InvalidOperationException("Bạn không thể tự khóa tài khoản của chính mình.");

            var account = await _context.UserAccounts.FindAsync(accountId);
            if (account == null) return false;

            // Đảo trạng thái IsActive (1 <-> 0)
            account.IsActive = !account.IsActive;

            return await _context.SaveChangesAsync() > 0;
        }

        // 6. Đổi mật khẩu
        public async Task<bool> ChangePasswordAsync(int accountId, string newPassword)
        {
            var account = await _context.UserAccounts.FindAsync(accountId);
            if (account == null) return false;

            // KIỂM TRA TRÙNG MẬT KHẨU
            if (account.PasswordHash == newPassword)
            {
                throw new Exception("Mật khẩu mới không được trùng với mật khẩu cũ!");
            }

            account.PasswordHash = newPassword;
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> UpdateAccountAsync(int accountId, UpdateAccountRequest request)
        {
            var account = await _context.UserAccounts.FindAsync(accountId);
            if (account == null) return false;

            // Cập nhật RoleID từ request gửi lên
            account.RoleID = request.RoleID;

            _context.UserAccounts.Update(account);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}