using HRM_Domain.Entities;

namespace HRM_Application.Contracts.Repositories
{
    public interface IPayrollRepository
    {
        Task<MonthlyTimesheet?> GetTimesheetAsync(int employeeId, int month, int year);
        Task UpsertPayrollAsync(MonthlyPayroll payroll);
        Task<IEnumerable<MonthlyPayroll>> GetMonthlyPayrollAsync(int month, int year, int userId, string userRole);

        // Hai hàm mới cho Review và Approval
        Task<MonthlyPayroll?> GetByIdAsync(int id);
        Task UpdateAdjustmentAsync(int payrollId, decimal amount, string reason);
        Task AddAdjustmentAsync(int payrollId, decimal amount, string reason); // Cộng dồn nhiều lần
        Task ApproveStatusAsync(int payrollId, string status, int managerId);
        Task<MonthlyPayroll?> GetEmployeePayrollAsync(int employeeId, int month, int year);
        
    }
}