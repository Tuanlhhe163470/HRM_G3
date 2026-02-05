namespace HRM_Application.DTOs.Employees.Requests;

public class CreateEmployeeRequest
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Position { get; set; }
}
