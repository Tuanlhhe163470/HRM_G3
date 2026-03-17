using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Authentication;

namespace HRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        private int GetCurrentAccountId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _accountService.GetAllAccountsAsync());

        [HttpGet("employees-without-account")]
        public async Task<IActionResult> GetWithoutAccount() => Ok(await _accountService.GetEmployeesWithoutAccountAsync());

        [HttpPost("create")]
        public async Task<IActionResult> Create(CreateAccountRequest request)
        {
            try
            {
                await _accountService.CreateAccountAsync(request);
                return Ok(new { message = "Thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // --- BỔ SUNG: CẬP NHẬT ROLE ---
        // Endpoint: PUT /api/Accounts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountRequest request)
        {
            try
            {
                // Bạn cần bổ sung phương thức UpdateAccountAsync vào IAccountService và AccountService
                // Ở đây tôi giả định bạn sẽ cập nhật RoleID cho AccountID tương ứng
                var result = await _accountService.UpdateAccountAsync(id, request);
                return result ? Ok(new { message = "Cập nhật thành công" }) : NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint: PUT /api/Accounts/{id}/change-password
        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.Password))
                    return BadRequest(new { message = "Mật khẩu không được để trống" });

                var result = await _accountService.ChangePasswordAsync(id, request.Password);

                if (!result) return NotFound(new { message = "Không tìm thấy tài khoản để cập nhật" });

                return Ok(new { message = "Reset mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _accountService.DeleteAccountAsync(id, GetCurrentAccountId());
                return result ? Ok(new { message = "Đã xóa" }) : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var result = await _accountService.ToggleStatusAsync(id, GetCurrentAccountId());
                return result ? Ok(new { message = "Cập nhật trạng thái thành công" }) : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}