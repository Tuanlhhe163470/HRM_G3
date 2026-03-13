using System;
using HRM_Application.DTOs.Commons;

namespace HRM_Application.DTOs.LaborContract.Responses
{
    public class LaborContractResponse
    {
        public int ContractID { get; set; }

        public BaseReferenceResponse? Employee { get; set; }

        public string ContractType { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal BaseSalary { get; set; }
        public bool IsActive { get; set; }
        public DateTime? SignedDate { get; set; }
    }
}