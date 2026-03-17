using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IUserRepository
    {
        Task<bool> IsUsernameExistAsync(string username);
        Task<bool> HasAccountAsync(int employeeId);
        Task CreateAccountAsync(UserAccount account);
    }
}
