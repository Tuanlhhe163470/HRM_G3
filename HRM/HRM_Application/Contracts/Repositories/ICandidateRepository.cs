using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface ICandidateRepository
    {
        Task<Candidate> AddAsync(Candidate candidate);
        Task<Application> AddApplicationAsync(Application application);
        Task<Candidate?> GetByEmailAsync(string email);
        Task<IEnumerable<Candidate>> GetAllWithJobAsync();
        Task UpdateAsync(Candidate candidate);
        Task<Candidate> GetByIdAsync(int id);
        Task<bool> UpdateStatusAsync(int id, string status);
       
    }
}
