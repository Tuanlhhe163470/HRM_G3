using HRM_Application.DTOs.Commons;

namespace HRM_Application.DTOs.Department.Responses
{
    public class DepartmentResponse
    {
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public BaseReferenceResponse? Manager { get; set; }
        public string? Phone { get; set; }
    }
}