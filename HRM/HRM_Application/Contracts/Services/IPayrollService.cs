using HRM_Application.DTOs;
using HRM_Application.DTOs.PayRoll;

namespace HRM_Application.Contracts.Services
{
    public interface IPayrollService
    {
        Task<bool> CalculateMonthlyPayrollAsync(int month, int year);
        Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year);

        // Thêm vào để Controller có thể gọi
        Task<bool> AdjustPayrollAsync(int id, decimal amount, string reason);
        Task<bool> ApprovePayrollAsync(int id, int managerId, bool isApproved);
    }
}