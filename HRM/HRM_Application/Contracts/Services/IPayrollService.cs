using HRM_Application.DTOs;
using HRM_Application.DTOs.PayRoll;

namespace HRM_Application.Contracts.Services
{
    public interface IPayrollService
    {
        Task<bool> CalculateMonthlyPayrollAsync(int month, int year);
        Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year, int userId, string userRole);
        Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason, int managerId);   // Ghi đè
        Task<bool> AddAdjustmentAsync(int id, decimal amount, string reason, int managerId);    // Cộng dồn nhiều lần
        Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved);
        Task<bool> ResubmitPayrollAsync(int id);

        // CHỈ GIỮ LẠI 1 HÀM NÀY, trả về PayrollDTO
        Task<PayrollDTO?> GetPersonalPayrollAsync(int employeeId, int month, int year);
    }
}