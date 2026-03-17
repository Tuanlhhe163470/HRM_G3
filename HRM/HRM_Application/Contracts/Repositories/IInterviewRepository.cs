using HRM_Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IInterviewRepository
    {
        // Thêm mới một cuộc phỏng vấn vào bảng dbo.Interviews
        Task<bool> AddAsync(Interview interview);

        // Lấy thông tin phỏng vấn theo ID
        Task<Interview?> GetByIdAsync(int id);

        // Lấy danh sách lịch phỏng vấn theo CandidateID
        Task<IEnumerable<Interview>> GetByCandidateIdAsync(int candidateId);

        // Cập nhật kết quả hoặc thông tin buổi phỏng vấn
        Task<bool> UpdateAsync(Interview interview);
        Task<IEnumerable<Interview>> GetAllWithCandidateAsync();
    }
}