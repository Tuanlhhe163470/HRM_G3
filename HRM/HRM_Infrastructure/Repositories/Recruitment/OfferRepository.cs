using HRM_Application.Contracts.Repositories;
using HRM_Domain.Entities;
using HRM_Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.Recruitment
{
    public class OfferRepository : IOfferRepository
    {
        private readonly HRMDbContext _context;

        public OfferRepository(HRMDbContext context)
        {
            _context = context;
        }

        // Triển khai hàm lấy theo CandidateID
        public async Task<Offer?> GetByCandidateIdAsync(int candidateId)
        {
            return await _context.Offers
                .Include(o => o.OfferAllowances) // Lấy kèm danh sách phụ cấp
                .FirstOrDefaultAsync(o => o.CandidateID == candidateId);
        }

        // Triển khai các hàm cơ bản để CandidateService có thể gọi
        public async Task AddAsync(Offer offer)
        {
            await _context.Offers.AddAsync(offer);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Offer offer)
        {
            _context.Offers.Update(offer);
            await _context.SaveChangesAsync();
        }

        public async Task<Offer?> GetByIdAsync(int id)
        {
            return await _context.Offers
                .Include(o => o.OfferAllowances)
                .FirstOrDefaultAsync(o => o.OfferID == id);
        }

        // Các hàm bổ sung nếu IOfferRepository yêu cầu
        public async Task<Offer?> GetOfferWithDetailsAsync(int offerId)
        {
            return await _context.Offers
                .Include(o => o.Candidate)
                .Include(o => o.OfferAllowances)
                    .ThenInclude(oa => oa.SalaryComponent)
                .FirstOrDefaultAsync(o => o.OfferID == offerId);
        }

        public async Task<IEnumerable<Offer>> GetOffersByCandidateIdAsync(int candidateId)
        {
            return await _context.Offers
                .Where(o => o.CandidateID == candidateId)
                .OrderByDescending(o => o.OfferedDate)
                .ToListAsync();
        }

        public async Task<bool> HasActiveOfferAsync(int candidateId)
        {
            return await _context.Offers
                .AnyAsync(o => o.CandidateID == candidateId &&
                              (o.OfferStatus == "Sent" || o.OfferStatus == "Accepted"));
        }
    }
}