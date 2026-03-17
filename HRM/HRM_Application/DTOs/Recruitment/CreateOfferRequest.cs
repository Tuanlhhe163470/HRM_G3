using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Recruitment
{
    public class CreateOfferRequest
    {
        public int CandidateID { get; set; }
        public decimal BasicSalary { get; set; }
        public DateTime JoinDate { get; set; }
        public string? Note { get; set; }
        public List<int>? AllowanceIds { get; set; }
    }
}
