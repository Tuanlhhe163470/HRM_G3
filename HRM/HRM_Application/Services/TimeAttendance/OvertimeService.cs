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

            // Yêu cầu OT tối thiểu 30 phút
            if ((dto.EndTime - dto.StartTime).TotalMinutes < 30)
                throw new ArgumentException("Thời gian đăng ký OT tối thiểu phải từ 30 phút trở lên.");

            var employee = await _employeeRepo.GetEmployeeByIdAsync(employeeId);
            if (employee == null) throw new KeyNotFoundException("Không tìm thấy nhân viên.");

            var request = _mapper.Map<OvertimeRequest>(dto);
            request.EmployeeId = employeeId;
            request.CreatedAt = DateTime.Now;

            // Vượt cấp nếu không có Sếp
            if (employee.ManagerID == null)
            {
                request.Status = ExplanationStatus.PendingHR;
                request.ManagerId = null;
            }
            else
            {
                request.ManagerId = employee.ManagerID.Value;
                request.Status = ExplanationStatus.PendingManager;
            }

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

            // ==========================================
            // QUY TRÌNH MANAGER DUYỆT
            // ==========================================
            if (role == "Manager" && request.Status == ExplanationStatus.PendingManager)
            {
                if (request.ManagerId != reviewerId)
                    throw new UnauthorizedAccessException("Bạn không phải Quản lý của nhân viên này.");

                request.ManagerNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.PendingHR : ExplanationStatus.Rejected;
            }
            // ==========================================
            // QUY TRÌNH HR DUYỆT & ĐỐI SOÁT CHẤM CÔNG
            // ==========================================
            else if (role == "HR" && (request.Status == ExplanationStatus.PendingHR || request.Status == ExplanationStatus.PendingManager))
            {
                request.HRAdminId = reviewerId;
                request.HRNote = dto.Note;
                request.Status = dto.IsApproved ? ExplanationStatus.Approved : ExplanationStatus.Rejected;

                if (dto.IsApproved)
                {
                    // 1. Lấy log chấm công của ngày hôm đó
                    var logs = await _attendanceRepo.GetLogsByDateRangeAsync(request.EmployeeId, request.Date, request.Date);
                    var logToday = logs.FirstOrDefault();

                    // 2. Tính số giờ xin
                    double requestedHours = (request.EndTime - request.StartTime).TotalHours;
                    // Xử lý OT xuyên đêm trên đơn
                    if (request.EndTime <= request.StartTime) requestedHours += 24;

                    if (logToday == null || !logToday.CheckOutTime.HasValue || !logToday.CheckInTime.HasValue)
                    {
                        // Không có log hoặc quên quẹt thẻ -> OT = 0 (Muốn có OT thì phải làm Đơn giải trình trước)
                        request.ApprovedHours = 0;
                        request.HRNote += " | [System: Không có dữ liệu quẹt thẻ thực tế, OT = 0]";
                    }
                    else
                    {

                        // Bước 3.1: Đưa StartTime và EndTime của đơn OT về chuẩn DateTime để so sánh
                        DateTime otStartPoint = request.Date.Date.Add(request.StartTime);
                        DateTime otEndPoint = request.Date.Date.Add(request.EndTime);
                        if (request.EndTime <= request.StartTime) otEndPoint = otEndPoint.AddDays(1); // Xuyên đêm

                        // Bước 3.2: Lấy mốc In/Out thực tế của máy chấm công
                        DateTime actualInPoint = logToday.CheckInTime.Value;
                        DateTime actualOutPoint = logToday.CheckOutTime.Value;

                        // Bắt đầu tính tiền từ lúc: Giờ xin OT HOẶC Giờ nhân viên thực tế có mặt (Cái nào MỘT TRONG HAI cái XẢY RA SAU thì lấy)
                        DateTime effectiveStart = actualInPoint > otStartPoint ? actualInPoint : otStartPoint;

                        // Kết thúc tính tiền lúc: Giờ hết OT HOẶC Giờ nhân viên thực tế ra về (Cái nào XẢY RA TRƯỚC thì lấy)
                        DateTime effectiveEnd = actualOutPoint < otEndPoint ? actualOutPoint : otEndPoint;

                        if (effectiveEnd > effectiveStart)
                        {
                            double actualHours = (effectiveEnd - effectiveStart).TotalHours;
                            // Chốt số giờ (Ép nhỏ lại theo yêu cầu trên đơn để chống việc cố tình ngồi lố giờ)
                            request.ApprovedHours = Math.Round(Math.Min(requestedHours, actualHours), 2);
                        }
                        else
                        {
                            // Ra về trước khi giờ OT bắt đầu -> OT = 0
                            request.ApprovedHours = 0;
                        }
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