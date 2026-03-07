using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.DTOs.Recruitment
{
    public class EvaluationRequest
    {
        public int CandidateID { get; set; }
        public int Score { get; set; } // Score (1-10)
        public string Comment { get; set; } = string.Empty;
        public string FinalDecision { get; set; } = string.Empty; // PASS hoặc FAIL
    }
}
