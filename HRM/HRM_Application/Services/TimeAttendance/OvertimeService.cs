using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.Overtime;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class OvertimeService : IOvertimeService
    {
        private readonly IOvertimeRequestRepository _otRepo;
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IMapper _mapper;

        public OvertimeService(
            IOvertimeRequestRepository otRepo,
            IAttendanceRepository attendanceRepo,
            IEmployeeRepository employeeRepo,
            IMapper mapper)
        {
            _otRepo = otRepo;
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
            _mapper = mapper;
        }

        public async Task SubmitRequestAsync(int employeeId, CreateOvertimeRequestDto dto)
        {
            if (dto.EndTime <= dto.StartTime)
                throw new ArgumentException("Giờ kết thúc OT phải lớn hơn giờ bắt đầu.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(employeeId);
            if (employee == null) throw new KeyNotFoundException("Không tìm thấy nhân viên.");
            if (employee.ManagerID == null) throw new InvalidOperationException("Bạn chưa có Quản lý trực tiếp để duyệt đơn.");

            var request = _mapper.Map<OvertimeRequest>(dto);
            request.EmployeeId = employeeId;
            request.ManagerId = employee.ManagerID.Value;
            request.Status = ExplanationStatus.PendingManager;
            request.CreatedAt = DateTime.Now;

            await _otRepo.AddAsync(request);
        }

        public async Task<List<OvertimeRequestHistoryDto>> GetMyRequestsAsync(int employeeId)
        {
            var requests = await _otRepo.GetByEmployeeIdAsync(employeeId);
            return _mapper.Map<List<OvertimeRequestHistoryDto>>(requests);
        }

        public async Task<List<OvertimeRequestHistoryDto>> GetPendingRequestsAsync(string role)
        {
            var requests = await _otRepo.GetPendingRequestsAsync();

            if (role == "Manager")
                requests = requests.Where(x => x.Status == ExplanationStatus.PendingManager).ToList();
            else if (role == "HR")
                requests = requests.Where(x => x.Status == ExplanationStatus.PendingHR).ToList();

            return _mapper.Map<List<OvertimeRequestHistoryDto>>(requests);
        }

        public async Task ReviewRequestAsync(int id, string role, int reviewerId, ReviewOvertimeDto dto)
        {
            var request = await _otRepo.GetByIdAsync(id);
            if (request == null) throw new KeyNotFoundException("Không tìm thấy đơn OT.");

            if (!dto.IsApproved && string.IsNullOrWhiteSpace(dto.Note))
                throw new ArgumentException("Bắt buộc phải nhập lý do khi từ chối.");

            // QUY TRÌNH MANAGER DUYỆT
            if (role == "Manager" && request.Status == ExplanationStatus.PendingManager)
            {
                if (request.ManagerId != reviewerId)
                    throw new UnauthorizedAccessException("Bạn không phải Quản lý của nhân viên này.");

                request.ManagerNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.PendingHR : ExplanationStatus.Rejected;
            }
            // QUY TRÌNH HR DUYỆT & ĐỐI SOÁT CHẤM CÔNG
            else if (role == "HR" && request.Status == ExplanationStatus.PendingHR)
            {
                request.HRAdminId = reviewerId;
                request.HRNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.Approved : ExplanationStatus.Rejected;

                if (dto.IsApproved)
                {

                    // 1. Lấy log chấm công của ngày hôm đó
                    var logs = await _attendanceRepo.GetLogsByDateRangeAsync(request.EmployeeId, request.Date, request.Date);
                    var logToday = logs.FirstOrDefault();

                    // 2. Tính số giờ xin (Requested)
                    double requestedHours = (request.EndTime - request.StartTime).TotalHours;

                    if (logToday == null || !logToday.CheckOutTime.HasValue)
                    {
                        // Không có log hoặc quên quẹt thẻ ra -> OT = 0
                        request.ApprovedHours = 0;
                    }
                    else
                    {
                        // 3. Tính số giờ thực tế (Actual)
                        TimeSpan actualCheckOut = logToday.CheckOutTime.Value.TimeOfDay;
                        TimeSpan actualDuration = actualCheckOut - request.StartTime;

                        double actualHours = actualDuration.TotalHours > 0 ? actualDuration.TotalHours : 0;

                        request.ApprovedHours = Math.Min(requestedHours, actualHours);

                        request.ApprovedHours = Math.Round(request.ApprovedHours, 2);
                    }
                }
            }
            else
            {
                throw new InvalidOperationException("Trạng thái đơn không hợp lệ để duyệt.");
            }

            await _otRepo.UpdateAsync(request);
        }
    }
}