using HRM_Application.DTOs.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Services
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(string username, string password);
    }
}
