using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.TimeAttendance;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using HRM_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class AttendanceExplanationService : IAttendanceExplanationService
    {
        private readonly IAttendanceExplanationRepository _explanationRepo;
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IMapper _mapper;

        public AttendanceExplanationService(
            IAttendanceExplanationRepository explanationRepo,
            IAttendanceRepository attendanceRepo,
            IEmployeeRepository employeeRepo,
            IMapper mapper)
        {
            _explanationRepo = explanationRepo;
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
            _mapper = mapper;
        }

        public async Task<AttendanceExplanationResponse> SubmitExplanationAsync(int employeeId, SubmitExplanationRequest request)
        {
            var log = await _attendanceRepo.GetByIdAsync(request.AttendanceLogId);
            if (log == null) throw new KeyNotFoundException("Không tìm thấy ca làm việc này.");

            if (log.EmployeeId != employeeId) throw new UnauthorizedAccessException("Bạn không có quyền nộp giải trình cho bảng công của người khác!");

            // 1. Kiểm tra SLA Khóa sổ (7 ngày)
            double daysSinceError = (DateTime.Now.Date - log.WorkDate.Date).TotalDays;
            if (daysSinceError > 7)
            {
                throw new InvalidOperationException($"Đã quá hạn giải trình! Bạn chỉ được phép giải trình cho các ngày trong vòng 7 ngày qua. Ngày lỗi: {log.WorkDate:dd/MM/yyyy}"); // Đã fix tên biến log
            }

            if (request.ExpectedCheckInTime.HasValue && request.ExpectedCheckOutTime.HasValue)
            {
                if (request.ExpectedCheckInTime.Value >= request.ExpectedCheckOutTime.Value)
                    throw new ArgumentException("Giờ Check-in dự kiến phải nhỏ hơn giờ Check-out dự kiến.");
            }

            bool hasPending = await _explanationRepo.HasPendingExplanationAsync(request.AttendanceLogId);
            if (hasPending) throw new InvalidOperationException("Ca làm việc này đang có một đơn giải trình chờ duyệt.");

            var newExplanation = _mapper.Map<AttendanceExplanation>(request);
            newExplanation.EmployeeId = employeeId;
            newExplanation.CreatedAt = DateTime.Now;

            // =========================================================================
            // 🌟 LUẬT BYPASS MANAGER: Không có quản lý -> Chuyển thẳng HR
            // =========================================================================
            var employee = await _employeeRepo.GetEmployeeByIdAsync(employeeId);
            if (employee.ManagerID == null)
            {
                newExplanation.Status = ExplanationStatus.PendingHR; // Nhảy cóc thẳng lên HR
                newExplanation.HRNote = "[Hệ thống]: Nhân viên không có Quản lý trực tiếp, đơn được tự động chuyển cho HR duyệt.";
            }
            else
            {
                newExplanation.ManagerId = employee.ManagerID.Value;
                newExplanation.Status = ExplanationStatus.PendingManager; // Đi theo luồng 2 cấp bình thường
            }

            var savedEntity = await _explanationRepo.AddAsync(newExplanation);

            return _mapper.Map<AttendanceExplanationResponse>(savedEntity);
        }

        public async Task<List<AttendanceExplanationResponse>> GetMyExplanationsAsync(int employeeId)
        {
            var entities = await _explanationRepo.GetByEmployeeIdAsync(employeeId);
            return _mapper.Map<List<AttendanceExplanationResponse>>(entities);
        }

        public async Task<AttendanceExplanationResponse> GetByIdAsync(int explanationId)
        {
            var entity = await _explanationRepo.GetByIdAsync(explanationId);
            if (entity == null)
                throw new KeyNotFoundException($"Không tìm thấy đơn giải trình với ID {explanationId}.");

            return _mapper.Map<AttendanceExplanationResponse>(entity);
        }

        public async Task<AttendanceExplanationResponse> ReviewExplanationAsync(int explanationId, int reviewerId, string role, ReviewExplanationRequest request)
        {
            var explanation = await _explanationRepo.GetExplanationWithDetailsAsync(explanationId);
            if (explanation == null) throw new KeyNotFoundException("Không tìm thấy đơn.");

            if (explanation.Status == ExplanationStatus.Approved || explanation.Status == ExplanationStatus.Rejected)
                throw new InvalidOperationException("Đơn này đã được xử lý.");

            var log = explanation.AttendanceLog;

            // =========================================================================
            // XỬ LÝ CHO ROLE: QUẢN LÝ (MANAGER)
            // =========================================================================
            if (role == "Manager")
            {
                if (explanation.Status != ExplanationStatus.PendingManager)
                    throw new InvalidOperationException("Đơn này không chờ Quản lý duyệt.");

                // Cần kiểm tra quyền: Có đúng Sếp của nhân viên này không?
                if (explanation.ManagerId != reviewerId)
                    throw new UnauthorizedAccessException("Bạn không phải là Quản lý trực tiếp của nhân viên này.");

                explanation.ManagerActionDate = DateTime.Now;
                explanation.ManagerNote = request.Note;

                if (request.IsApproved)
                {
                    explanation.Status = ExplanationStatus.PendingHR;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.Note)) throw new ArgumentException("Vui lòng nhập lý do từ chối.");
                    explanation.Status = ExplanationStatus.Rejected;
                }
            }
            // =========================================================================
            // XỬ LÝ CHO ROLE: NHÂN SỰ (HR) - CHỐT SỔ VÀ TÍNH TOÁN LẠI
            // =========================================================================
            else if (role == "HR")
            {
                // Cho phép HR duyệt các đơn PendingHR (hoặc HR có quyền ghi đè duyệt luôn đơn PendingManager)
                if (explanation.Status != ExplanationStatus.PendingHR && explanation.Status != ExplanationStatus.PendingManager)
                    throw new InvalidOperationException("Đơn này không hợp lệ để HR duyệt.");

                explanation.HRAdminId = reviewerId;
                explanation.HRActionDate = DateTime.Now;
                explanation.HRNote = string.IsNullOrEmpty(explanation.HRNote) ? request.Note : explanation.HRNote + $" | [HR]: {request.Note}";

                if (request.IsApproved)
                {
                    explanation.Status = ExplanationStatus.Approved;

                    if (log != null && log.ShiftConfig != null)
                    {
                        // 1. Khôi phục mốc thời gian
                        if (explanation.ExpectedCheckInTime.HasValue)
                        {
                            var timeIn = explanation.ExpectedCheckInTime.Value.TimeOfDay;
                            log.CheckInTime = log.WorkDate.Date.Add(timeIn);
                        }

                        if (explanation.ExpectedCheckOutTime.HasValue)
                        {
                            var timeOut = explanation.ExpectedCheckOutTime.Value.TimeOfDay;
                            var checkOutDateTime = log.WorkDate.Date.Add(timeOut);

                            if (log.CheckInTime.HasValue && checkOutDateTime <= log.CheckInTime.Value)
                            {
                                checkOutDateTime = checkOutDateTime.AddDays(1);
                            }
                            log.CheckOutTime = checkOutDateTime;
                        }

                        // 2. Clear án tích cũ
                        log.LateMinutes = 0;
                        log.EarlyLeaveMinutes = 0;
                        log.Status = AttendanceStatus.OnTime; // Mặc định là OnTime, hàm Calculate sẽ tự phán xét lại nếu vẫn đi muộn

                        // 3. Tính toán lại từ đầu (Recalculate)
                        CalculateAttendanceMetrics(log, log.ShiftConfig);

                        log.Note = (log.Note + $" | [System: Đã khôi phục giờ theo Đơn Giải Trình #{explanation.Id}]").Trim();
                        await _attendanceRepo.UpdateAsync(log);
                    }
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.Note)) throw new ArgumentException("Vui lòng nhập lý do từ chối.");
                    explanation.Status = ExplanationStatus.Rejected;
                }
            }
            else
            {
                throw new UnauthorizedAccessException("Bạn không có quyền duyệt đơn này.");
            }

            explanation.UpdatedAt = DateTime.Now;
            await _explanationRepo.UpdateAsync(explanation);

            return _mapper.Map<AttendanceExplanationResponse>(explanation);
        }

        public async Task<List<AttendanceExplanationResponse>> GetPendingExplanationsAsync(int reviewerId, string role)
        {
            if (role != "Manager" && role != "HR")
                throw new UnauthorizedAccessException("Bạn không có quyền xem danh sách chờ duyệt.");

            var entities = await _explanationRepo.GetPendingExplanationsAsync(role, reviewerId);
            return _mapper.Map<List<AttendanceExplanationResponse>>(entities);
        }

        private void CalculateAttendanceMetrics(AttendanceLog log, ShiftConfig shift)
        {
            // (Đoạn hàm tính toán này của bạn đã cực kỳ chuẩn xác, tôi giữ nguyên không sửa 1 ký tự nào)
            if (log.CheckInTime == null || log.CheckOutTime == null) return;

            var shiftStart = log.WorkDate.Date.Add(shift.StartTime);
            var shiftEnd = log.WorkDate.Date.Add(shift.EndTime);

            if (shift.EndTime <= shift.StartTime)
            {
                shiftEnd = shiftEnd.AddDays(1);
            }

            var actualIn = log.CheckInTime.Value;
            var actualOut = log.CheckOutTime.Value;

            var effectiveIn = actualIn > shiftStart ? actualIn : shiftStart;
            var effectiveOut = actualOut < shiftEnd ? actualOut : shiftEnd;

            double totalValidHours = 0;

            if (effectiveOut > effectiveIn)
            {
                totalValidHours = (effectiveOut - effectiveIn).TotalHours;

                if (shift.BreakStartTime.HasValue && shift.BreakEndTime.HasValue)
                {
                    var breakStart = log.WorkDate.Date.Add(shift.BreakStartTime.Value);
                    var breakEnd = log.WorkDate.Date.Add(shift.BreakEndTime.Value);

                    if (shift.BreakStartTime.Value < shift.StartTime) breakStart = breakStart.AddDays(1);
                    if (shift.BreakEndTime.Value < shift.BreakStartTime.Value) breakEnd = breakEnd.AddDays(1);

                    var overlapStart = effectiveIn > breakStart ? effectiveIn : breakStart;
                    var overlapEnd = effectiveOut < breakEnd ? effectiveOut : breakEnd;

                    if (overlapStart < overlapEnd)
                    {
                        totalValidHours -= (overlapEnd - overlapStart).TotalHours;
                    }
                }
            }

            if (actualIn > shiftStart)
            {
                int lateMins = (int)(actualIn - shiftStart).TotalMinutes;
                if (lateMins > shift.AllowedLateMinutes)
                {
                    log.Status = AttendanceStatus.Late;
                    log.LateMinutes = lateMins;
                }
            }

            if (actualOut < shiftEnd)
            {
                int earlyMins = (int)(shiftEnd - actualOut).TotalMinutes;
                if (earlyMins > shift.AllowedEarlyLeaveMinutes)
                {
                    if (log.Status != AttendanceStatus.Late)
                    {
                        log.Status = AttendanceStatus.EarlyLeave;
                    }
                    log.EarlyLeaveMinutes = earlyMins;
                }
            }

            log.WorkingHours = Math.Round(Math.Max(totalValidHours, 0), 2);

            var allowedEarlyTime = shiftEnd.AddMinutes(-shift.AllowedEarlyLeaveMinutes);
            if (actualOut < allowedEarlyTime && log.Status != AttendanceStatus.Late)
            {
                log.Status = AttendanceStatus.EarlyLeave;
            }
        }
    }
}