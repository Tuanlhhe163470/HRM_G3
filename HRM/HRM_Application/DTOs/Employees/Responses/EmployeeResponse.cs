namespace HRM_Application.DTOs.Employees.Responses;

public class EmployeeResponse
{
    public int EmployeeID { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public DateTime DateOfBirth { get; set; }
    public string Position { get; set; } = default!;
}
