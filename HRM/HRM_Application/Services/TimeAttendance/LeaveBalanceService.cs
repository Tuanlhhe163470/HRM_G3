using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.LeaveBalance.Requests;
using HRM_Application.DTOs.LeaveBalance.Responses;
using HRM_Application.Interfaces.Repositories;
using HRM_Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.HRCore
{
    public class LeaveBalanceService : ILeaveBalanceService
    {
        private readonly ILeaveBalanceRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public LeaveBalanceService(ILeaveBalanceRepository repository, IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<PagedResponse<LeaveBalanceResponse>> GetAllAsync(PaginationFilter filter)
        {
            var pagedEntities = await _repository.GetAllAsync(filter);
            var dtoList = _mapper.Map<List<LeaveBalanceResponse>>(pagedEntities.Data);
            return new PagedResponse<LeaveBalanceResponse>(dtoList, pagedEntities.PageNumber, pagedEntities.PageSize, pagedEntities.TotalRecords);
        }

        public async Task<LeaveBalanceResponse?> GetByEmployeeAndYearAsync(int employeeId, int leaveTypeId, int year)
        {
            var entity = await _repository.GetByEmployeeAndYearAsync(employeeId, leaveTypeId, year);
            return entity == null ? null : _mapper.Map<LeaveBalanceResponse>(entity);
        }

        public async Task GenerateAnnualLeaveBalancesAsync(GenerateLeaveBalanceRequest request)
        {
            // 1. Nếu năm nay đã tạo rồi thì không tạo nữa
            var hasGenerated = await _repository.HasGeneratedForYearAsync(request.Year, request.LeaveTypeId);
            if (hasGenerated) throw new InvalidOperationException($"Quỹ phép cho năm {request.Year} đã được khởi tạo trước đó!");

            // 2. Lấy toàn bộ nhân viên (nhớ đổi sang lấy employee active)
            var allEmployees = await _employeeRepository.GetAllEmployeesAsync();
            var activeEmployees = allEmployees.Where(e => e.Status == "Active").ToList();

            if (!activeEmployees.Any()) throw new InvalidOperationException("Không có nhân viên Active nào để cấp phép.");

            var newBalances = new List<LeaveBalance>();
            foreach (var emp in activeEmployees)
            {
                newBalances.Add(new LeaveBalance
                {
                    EmployeeId = emp.EmployeeID,
                    LeaveTypeId = request.LeaveTypeId,
                    Year = request.Year,
                    TotalDays = request.DefaultDays,
                    UsedDays = 0 // Mới tạo thì chưa dùng ngày nào
                });
            }

            await _repository.AddRangeAsync(newBalances);
        }

        // --- HR CHỈNH SỬA TAY ---
        public async Task AdjustLeaveBalanceAsync(int id, AdjustLeaveBalanceRequest request)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException("Không tìm thấy Quỹ phép này.");

            if (request.NewTotalDays < entity.UsedDays)
            {
                throw new InvalidOperationException($"Không thể giảm tổng số ngày phép xuống thấp hơn số ngày đã nghỉ ({entity.UsedDays} ngày).");
            }

            entity.TotalDays = request.NewTotalDays;
            await _repository.UpdateAsync(entity);
        }

        // --- TRỪ PHÉP KHI DUYỆT ĐƠN (Cực kỳ quan trọng) ---
        public async Task CheckAndDeductLeaveAsync(int employeeId, int leaveTypeId, int year, double daysToDeduct)
        {
            var balance = await _repository.GetByEmployeeAndYearAsync(employeeId, leaveTypeId, year);
            if (balance == null) throw new InvalidOperationException("Nhân viên này chưa có quỹ phép cho năm hiện tại.");

            if ((balance.TotalDays - balance.UsedDays) < daysToDeduct)
            {
                throw new InvalidOperationException($"Nhân viên không đủ quỹ phép. Còn lại: {balance.TotalDays - balance.UsedDays} ngày, Cần: {daysToDeduct} ngày.");
            }

            // Cập nhật số ngày đã dùng
            balance.UsedDays += daysToDeduct;
            await _repository.UpdateAsync(balance);
        }
    }
}