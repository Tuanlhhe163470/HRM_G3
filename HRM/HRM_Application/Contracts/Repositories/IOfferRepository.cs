using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Contracts.Repositories
{
    public interface IOfferRepository 
    {
        Task AddAsync(Offer offer);
        Task UpdateAsync(Offer offer);
        // Lấy thông tin Offer kèm theo thông tin ứng viên và các phụ cấp (Allowances)
        Task<Offer?> GetOfferWithDetailsAsync(int offerId);

        // Lấy danh sách Offer của một ứng viên cụ thể
        Task<IEnumerable<Offer>> GetOffersByCandidateIdAsync(int candidateId);

        // Kiểm tra xem ứng viên đã có Offer nào đang ở trạng thái 'Sent' hoặc 'Accepted' chưa
        Task<bool> HasActiveOfferAsync(int candidateId);
    }
}
