using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService) => _authService = authService;

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var token = await _authService.AuthenticateAsync(model.Username, model.Password);
            if (token == null) return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
            return Ok(new { Token = token });
        }
    }
}
