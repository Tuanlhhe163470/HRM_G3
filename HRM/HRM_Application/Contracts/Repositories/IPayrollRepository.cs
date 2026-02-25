using HRM_Domain.Entities;

namespace HRM_Application.Contracts.Repositories
{
    public interface IPayrollRepository
    {
        Task<bool> UpsertPayrollAsync(Payroll payroll);
        Task<IEnumerable<Payroll>> GetMonthlyPayrollAsync(int month, int year);
    }
}