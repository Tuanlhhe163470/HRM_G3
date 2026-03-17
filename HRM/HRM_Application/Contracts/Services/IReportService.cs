using System.Collections.Generic;
using System.Threading.Tasks;
using HRM_Application.DTOs.Report;

namespace HRM_Application.Contracts.Services
{
    public interface IReportService
    {
        // Hàm lấy báo cáo bảo hiểm
        Task<IEnumerable<InsuranceReportDTO>> GetInsuranceReportAsync(int month, int year);

        // Hàm lấy báo cáo thuế TNCN
        Task<IEnumerable<TaxReportDTO>> GetTaxReportAsync(int month, int year);
    }
}