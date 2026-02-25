using HRM_Application.DTOs;
using HRM_Application.DTOs.PayRoll;

namespace HRM_Application.Contracts.Services
{
    public interface IPayrollService
    {
        // Hàm quan trọng nhất: Chạy tính toán lương
        Task<bool> CalculateMonthlyPayrollAsync(int month, int year);
        Task<IEnumerable<PayrollDTO>> GetPayrollByMonthAsync(int month, int year);
    }
}