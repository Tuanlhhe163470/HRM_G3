using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Commons;
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

        public async Task<PagedResponse<LeaveBalanceResponse>> GetAllAsync(PaginationFilter filter, int year, int leaveTypeId)
        {
            // 1. Gọi Repo lấy danh sách Employee (kèm theo LeaveBalances bên trong nếu có)
            var pagedEntities = await _repository.GetAllAsync(filter, year, leaveTypeId);

            // 2. Map từ Employee sang DTO LeaveBalanceResponse
            var dtoList = pagedEntities.Data.Select(emp =>
            {
                // Lấy quỹ phép đầu tiên tìm được (nếu trống thì balance = null)
                var balance = emp.LeaveBalances?.FirstOrDefault();

                return new LeaveBalanceResponse
                {
                    Id = balance != null ? balance.Id : 0,

                    // Map BaseReference cho Frontend (Giữ đúng cấu trúc DTO của bạn)
                    Employee = new BaseReferenceResponse { Id = emp.EmployeeID, Name = emp.FullName },
                    LeaveType = balance != null
                                ? new BaseReferenceResponse { Id = balance.LeaveTypeId, Name = "Phép năm" }
                                : null,

                    Year = year,
                    TotalDays = balance != null ? balance.TotalDays : 0,
                    UsedDays = balance != null ? balance.UsedDays : 0,

                    EmployeeId = emp.EmployeeID,
                    EmployeeName = emp.FullName,
                    PositionName = emp.Position?.PositionName ?? "",
                    DepartmentName = emp.Department?.DepartmentName ?? "",
                    IsAllocated = balance != null
                };
            }).ToList();

            return new PagedResponse<LeaveBalanceResponse>(dtoList, pagedEntities.PageNumber, pagedEntities.PageSize, pagedEntities.TotalRecords);
        }

        public async Task<LeaveBalanceResponse?> GetByEmployeeAndYearAsync(int employeeId, int leaveTypeId, int year)
        {
            var entity = await _repository.GetByEmployeeAndYearAsync(employeeId, leaveTypeId, year);
            return entity == null ? null : _mapper.Map<LeaveBalanceResponse>(entity);
        }

        public async Task GenerateAnnualLeaveBalancesAsync(GenerateLeaveBalanceRequest request)
        {
            // 1. Lấy toàn bộ nhân viên đang làm việc
            var allEmployees = await _employeeRepository.GetAllEmployeesAsync();
            var activeEmployees = allEmployees
                .Where(e => e.Status == "Active" || e.Status == "Working")
                .ToList();

            if (!activeEmployees.Any()) throw new InvalidOperationException("Không có nhân viên hợp lệ để cấp phép.");

            // 2. Lấy những người ĐÃ CÓ phép trong năm nay
            var existingBalances = await _repository.GetBalancesByYearAsync(request.Year, request.LeaveTypeId);
            var existingEmpIds = existingBalances.Select(b => b.EmployeeId).ToHashSet();

            // 3. Lọc ra NHỮNG NGƯỜI CHƯA CÓ PHÉP (VD: Lê Văn Tài, chienkv...)
            var employeesNeedingBalance = activeEmployees
                .Where(e => !existingEmpIds.Contains(e.EmployeeID))
                .ToList();

            // 4. Nếu ai cũng có phép rồi thì mới báo lỗi này
            if (!employeesNeedingBalance.Any())
                throw new InvalidOperationException($"Toàn bộ nhân viên đã được cấp phép cho năm {request.Year}. Không có ai cần cấp mới.");

            var newBalances = new List<LeaveBalance>();

            foreach (var emp in employeesNeedingBalance)
            {
                double totalDaysAllocated = request.DefaultDays;

                // 5. TÍNH PHÉP THEO TỶ LỆ CHO NGƯỜI MỚI VÀO (Prorated Leave)
                if (emp.JoinDate.HasValue && emp.JoinDate.Value.Year == request.Year)
                {
                    int joinMonth = emp.JoinDate.Value.Month;
                    int joinDay = emp.JoinDate.Value.Day;

                    // Vào trước ngày 15 -> tính tháng đó. Vào sau ngày 15 -> tính từ tháng sau.
                    int effectiveStartMonth = joinDay <= 15 ? joinMonth : joinMonth + 1;

                    if (effectiveStartMonth <= 12)
                    {
                        int monthsWorked = 12 - effectiveStartMonth + 1;
                        totalDaysAllocated = Math.Round((request.DefaultDays / 12.0) * monthsWorked, 1);
                    }
                    else
                    {
                        totalDaysAllocated = 0;
                    }
                }

                newBalances.Add(new LeaveBalance
                {
                    EmployeeId = emp.EmployeeID,
                    LeaveTypeId = request.LeaveTypeId,
                    Year = request.Year,
                    TotalDays = totalDaysAllocated,
                    UsedDays = 0
                });
            }

            // 6. Lưu vào DB
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