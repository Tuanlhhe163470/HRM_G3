using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Authentication
{
    public class CreateAccountRequest
    {
        public int EmployeeID { get; set; }
        public string Username { get; set; }
        public string Password { get; set; } // Sẽ được hash sau
        public int RoleID { get; set; }
    }
}
