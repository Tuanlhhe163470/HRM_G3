using HRM_Application.DTOs;
using HRM_Application.DTOs.PayRoll;

namespace HRM_Application.Contracts.Services
{
    public interface IPayrollService
    {
        Task<bool> CalculateMonthlyPayrollAsync(int month, int year);
        Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year);
        Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason);   // Ghi đè
        Task<bool> AddAdjustmentAsync(int id, decimal amount, string reason);    // Cộng dồn nhiều lần
        Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved);

        // CHỈ GIỮ LẠI 1 HÀM NÀY, trả về PayrollDTO
        Task<PayrollDTO?> GetPersonalPayrollAsync(int employeeId, int month, int year);
    }
}