using HRM_Application.DTOs.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
 public interface IAccountService
    {
        Task<IEnumerable<AccountResponseDto>> GetAllAccountsAsync();
        Task<IEnumerable<EmployeeAccountStatusDto>> GetEmployeesWithoutAccountAsync();
        Task<bool> CreateAccountAsync(CreateAccountRequest request);
        Task<bool> ToggleStatusAsync(int accountId, int currentAdminId);
        Task<bool> DeleteAccountAsync(int accountId, int currentAdminId);
        Task<bool> UpdateAccountAsync(int accountId, UpdateAccountRequest request);
        Task<bool> ChangePasswordAsync(int accountId, string newPassword);
    }
}
