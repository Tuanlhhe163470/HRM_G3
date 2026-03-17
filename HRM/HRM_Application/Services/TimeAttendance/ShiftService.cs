using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PublicHoliday.Responses;
using HRM_Application.DTOs.Shift.Requests;
using HRM_Application.DTOs.Shift.Responses;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class ShiftService : IShiftService
    {
        private readonly IShiftRepository _repository;
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IAttendanceExplanationRepository _explanationRepo;
        private readonly IOvertimeRequestRepository _overtimeRepo;
        private readonly IMapper _mapper;

        public ShiftService(IShiftRepository repository, IAttendanceRepository attendanceRepo, IAttendanceExplanationRepository explanationRepo, IOvertimeRequestRepository overtimeRepo, IMapper mapper)
        {
            _repository = repository;
            _attendanceRepo = attendanceRepo;
            _explanationRepo = explanationRepo;
            _overtimeRepo = overtimeRepo;
            _mapper = mapper;
        }
        public async Task CreateShiftAsync(CreateShiftRequest request)
        {
            bool isDuplicate = await _repository.CheckShiftNameExistsAsync(request.ShiftName);
            if (isDuplicate)
            {
                throw new InvalidOperationException("Tên ca này đã tồn tại, vui lòng chọn tên khác.");
            }
            var shiftEntity = _mapper.Map<ShiftConfig>(request);
            await _repository.AddShiftAsync(shiftEntity);
        }

        public async Task DeleteShiftAsync(int id)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Ca làm việc với ID: {id}");
            }

            bool isUsedInLogs = await _attendanceRepo.HasLogsWithShiftAsync(id);

            if (isUsedInLogs)
            {
                throw new InvalidOperationException("Không thể xóa ca đã có dữ liệu chấm công. Vui lòng chuyển trạng thái sang Ngưng hoạt động (Inactive).");
            }

            await _repository.DeleteShiftAsync(id);
        }

        public async Task<PagedResponse<ShiftResponse>> GetAllShiftsAsync(PaginationFilter filter)
        {
            var shifts = await _repository.GetAllShiftsAsync(filter);
            var result = _mapper.Map<List<ShiftResponse>>(shifts.Data);

            return new PagedResponse<ShiftResponse>(
                result,
                shifts.PageNumber,
                shifts.PageSize,
                shifts.TotalRecords);
        }

        public async Task<ShiftResponse?> GetShiftByIdAsync(int id)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Ca làm việc với ID: {id}");
            }
            return _mapper.Map<ShiftResponse>(shiftEntity);
        }

        public async Task UpdateShiftAsync(int id, CreateShiftRequest request)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy ngày Ca làm việc với ID: {id}");
            }

            bool isTimeChanged = shiftEntity.StartTime.ToString(@"hh\:mm") != request.StartTime
                      || shiftEntity.EndTime.ToString(@"hh\:mm") != request.EndTime;

            if (isTimeChanged && !request.IsForceUpdate)
            {
                // Kiểm tra xem có đơn giải trình nào đang Pending thuộc Ca này không?
                bool hasPendingExplanations = await _explanationRepo.HasPendingExplanationByShiftAsync(id);
                bool hasPendingOvertimes = await _overtimeRepo.HasPendingOvertimesByShiftAsync(id);
                if (hasPendingExplanations || hasPendingOvertimes)
                {
                    throw new InvalidOperationException("WARNING_PENDING:Ca này đang có đơn giải trình chờ duyệt. Đổi giờ có thể làm sai lệch dữ liệu. Bạn có chắc chắn muốn lưu?");
                }
            }

            _mapper.Map(request, shiftEntity);

            await _repository.UpdateShiftAsync(shiftEntity);
        }
    }
}
