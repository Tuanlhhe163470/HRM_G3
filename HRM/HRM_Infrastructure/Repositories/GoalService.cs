using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.DTOs.Goals;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic; // <--- Cần thêm dòng này
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Repositories.GoalService
{
    public class GoalService : IGoalService
    {
        private readonly IPerformanceGoalRepository _repo;
        private readonly IMapper _mapper;

        public GoalService(IPerformanceGoalRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<HRM_Domain.Entities.PerformanceGoal> CreateGoal(CreateGoalDTO request)
        {
            if (request.Weight <= 0 || request.Weight > 100)
            {
                throw new Exception("Lỗi: Trọng số (Weight) phải lớn hơn 0 và nhỏ hơn hoặc bằng 100.");
            }

            // Logic kiểm tra tổng trọng số
            IEnumerable<HRM_Domain.Entities.PerformanceGoal> existingGoals = new List<HRM_Domain.Entities.PerformanceGoal>();

            // Kiểm tra null an toàn
            if (request.EmployeeID.HasValue && request.CycleID.HasValue)
            {
                existingGoals = await _repo.GetByEmployeeAndCycle(request.EmployeeID.Value, request.CycleID.Value);
            }

            // Tính tổng (Chỉ khai báo 1 lần)
            int currentTotalWeight = existingGoals.Sum(g => g.Weight);

            if (currentTotalWeight + request.Weight > 100)
            {
                throw new Exception($"Lỗi nghiệp vụ: Tổng trọng số không được vượt quá 100%. " +
                                    $"Hiện tại đã dùng: {currentTotalWeight}%, " +
                                    $"Bạn đang thêm: {request.Weight}%.");
            }

            var newGoal = _mapper.Map<HRM_Domain.Entities.PerformanceGoal>(request);
            newGoal.CreatedAt = DateTime.Now;
            newGoal.Status = "Draft";

            await _repo.AddAsync(newGoal);
            return newGoal;
        }
    }
}