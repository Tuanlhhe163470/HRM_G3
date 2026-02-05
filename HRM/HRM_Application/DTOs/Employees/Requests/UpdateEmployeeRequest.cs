namespace HRM_Application.DTOs.Employees.Requests;

public class UpdateEmployeeRequest
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public DateTime DateOfBirth { get; set; }
    public string Position { get; set; } = default!;
}
