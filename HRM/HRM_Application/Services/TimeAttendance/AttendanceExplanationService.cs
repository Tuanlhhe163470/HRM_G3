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
        private readonly IMapper _mapper;

        public AttendanceExplanationService(
            IAttendanceExplanationRepository explanationRepo,
            IAttendanceRepository attendanceRepo,
            IMapper mapper)
        {
            _explanationRepo = explanationRepo;
            _attendanceRepo = attendanceRepo;
            _mapper = mapper;
        }

        public async Task<AttendanceExplanationResponse> SubmitExplanationAsync(int employeeId, SubmitExplanationRequest request)
        {
            var log = await _attendanceRepo.GetByIdAsync(request.AttendanceLogId);
            if (log == null) throw new KeyNotFoundException("Không tìm thấy ca làm việc này.");

            if (log.EmployeeId != employeeId) throw new UnauthorizedAccessException("Bạn không có quyền nộp giải trình cho bảng công của người khác!");

            if (log.Status == AttendanceStatus.OnTime || log.Status == AttendanceStatus.Holiday)
            {
                throw new InvalidOperationException("Ca làm việc này đã được ghi nhận đúng giờ hoặc là ngày Lễ. Bạn không cần giải trình.");
            }

            bool hasPending = await _explanationRepo.HasPendingExplanationAsync(request.AttendanceLogId);
            if (hasPending) throw new InvalidOperationException("Ca làm việc này đang có một đơn giải trình chờ duyệt.");

            var newExplanation = _mapper.Map<AttendanceExplanation>(request);
            newExplanation.EmployeeId = employeeId;
            newExplanation.Status = ExplanationStatus.PendingManager;
            newExplanation.CreatedAt = DateTime.Now;

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
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn giải trình với ID {explanationId}.");
            }

            return _mapper.Map<AttendanceExplanationResponse>(entity);
        }

        public async Task<AttendanceExplanationResponse> ReviewExplanationAsync(int explanationId, int reviewerId, string role, ReviewExplanationRequest request)
        {
            var explanation = await _explanationRepo.GetExplanationWithDetailsAsync(explanationId);

            if (explanation == null) throw new KeyNotFoundException("Không tìm thấy đơn.");

            if (explanation.Status == ExplanationStatus.Approved || explanation.Status == ExplanationStatus.Rejected)
                throw new InvalidOperationException("Đơn này đã được xử lý.");

            var log = explanation.AttendanceLog;

            // XỬ LÝ CHO ROLE: QUẢN LÝ (MANAGER)
            if (role == "Manager")
            {
                if (explanation.Status != ExplanationStatus.PendingManager)
                    throw new InvalidOperationException("Đơn này không chờ Quản lý duyệt.");

                explanation.ManagerId = reviewerId;
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
            // XỬ LÝ CHO ROLE: NHÂN SỰ (HR)
            else if (role == "HR")
            {
                if (explanation.Status != ExplanationStatus.PendingHR && explanation.Status != ExplanationStatus.PendingManager)
                    throw new InvalidOperationException("Đơn này không hợp lệ để HR duyệt.");

                explanation.HRAdminId = reviewerId;
                explanation.HRActionDate = DateTime.Now;
                explanation.HRNote = request.Note;

                if (request.IsApproved)
                {
                    explanation.Status = ExplanationStatus.Approved;

                    if (log != null && log.ShiftConfig != null)
                    {
                        // 1. Ghi đè giờ mới (Nếu có)
                        if (explanation.ExpectedCheckInTime.HasValue)
                        {
                            var timeIn = explanation.ExpectedCheckInTime.Value.TimeOfDay;
                            log.CheckInTime = log.WorkDate.Date.Add(timeIn);
                        }

                        if (explanation.ExpectedCheckOutTime.HasValue)
                        {
                            var timeOut = explanation.ExpectedCheckOutTime.Value.TimeOfDay;
                            var checkOutDateTime = log.WorkDate.Date.Add(timeOut);

                            // Nếu ca đêm (Giờ ra nhỏ hơn giờ vào), tự động cộng thêm 1 ngày
                            if (log.CheckInTime.HasValue && checkOutDateTime <= log.CheckInTime.Value)
                            {
                                checkOutDateTime = checkOutDateTime.AddDays(1);
                            }
                            log.CheckOutTime = checkOutDateTime;
                        }

                        // 2. RESET lại toàn bộ lỗi cũ trước khi tính toán lại
                        log.LateMinutes = 0;
                        log.EarlyLeaveMinutes = 0;
                        log.Status = AttendanceStatus.OnTime;

                        CalculateAttendanceMetrics(log, log.ShiftConfig);

                        log.Note = "Đã cập nhật theo đơn giải trình #" + explanation.Id;
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
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem danh sách chờ duyệt.");
            }

            var entities = await _explanationRepo.GetPendingExplanationsAsync(role, reviewerId);

            return _mapper.Map<List<AttendanceExplanationResponse>>(entities);
        }

        private void CalculateAttendanceMetrics(AttendanceLog log, ShiftConfig shift)
        {
            // Guard clause: Nếu chưa có đủ In/Out thì không thể tính công
            if (log.CheckInTime == null || log.CheckOutTime == null) return;

            // =========================================================================
            // 1. CHUẨN HÓA KHUNG GIỜ CA LÀM VIỆC (SHIFT BOUNDARIES)
            // =========================================================================
            var shiftStart = log.WorkDate.Date.Add(shift.StartTime);
            var shiftEnd = log.WorkDate.Date.Add(shift.EndTime);

            // Xử lý Ca Đêm: Nếu giờ kết thúc nhỏ hơn giờ bắt đầu -> vắt qua ngày hôm sau
            if (shift.EndTime <= shift.StartTime)
            {
                shiftEnd = shiftEnd.AddDays(1);
            }

            // =========================================================================
            // 2. XÁC ĐỊNH THỜI GIAN LÀM VIỆC HỢP LỆ (EFFECTIVE WORKING TIME)
            // =========================================================================
            var actualIn = log.CheckInTime.Value;
            var actualOut = log.CheckOutTime.Value;

            // Ép mốc thời gian vào khung ca để chặn việc đi quá sớm hoặc nán lại quá muộn
            // Đi sớm hơn ca -> tính từ lúc bắt đầu ca. Về muộn hơn ca -> tính đến lúc kết thúc ca.
            var effectiveIn = actualIn > shiftStart ? actualIn : shiftStart;
            var effectiveOut = actualOut < shiftEnd ? actualOut : shiftEnd;

            double totalValidHours = 0;

            // Chỉ tính công nếu khoảng thời gian hợp lệ lớn hơn 0 (Tránh lỗi check-in sau khi ca đã kết thúc)
            if (effectiveOut > effectiveIn)
            {
                totalValidHours = (effectiveOut - effectiveIn).TotalHours;

                // =====================================================================
                // 3. TRỪ THỜI GIAN NGHỈ GIỮA CA (BREAK TIME OVERLAP CALCULATION)
                // =====================================================================
                if (shift.BreakStartTime.HasValue && shift.BreakEndTime.HasValue)
                {
                    var breakStart = log.WorkDate.Date.Add(shift.BreakStartTime.Value);
                    var breakEnd = log.WorkDate.Date.Add(shift.BreakEndTime.Value);

                    // Xử lý ca đêm cho mốc giờ nghỉ
                    if (shift.BreakStartTime.Value < shift.StartTime) breakStart = breakStart.AddDays(1);
                    if (shift.BreakEndTime.Value < shift.BreakStartTime.Value) breakEnd = breakEnd.AddDays(1);

                    // TÌM VÙNG GIAO NHAU (OVERLAP) giữa [Giờ làm việc] và [Giờ nghỉ]
                    var overlapStart = effectiveIn > breakStart ? effectiveIn : breakStart;
                    var overlapEnd = effectiveOut < breakEnd ? effectiveOut : breakEnd;

                    // Nếu có giao nhau, trừ đi đúng phần số giờ bị trùng
                    if (overlapStart < overlapEnd)
                    {
                        totalValidHours -= (overlapEnd - overlapStart).TotalHours;
                    }
                }
            }

            // =========================================================================
            // 4. CHỐT SỐ GIỜ CÔNG & XÉT TRẠNG THÁI (FINALIZE)
            // =========================================================================

            // 4.1 TÍNH PHÚT ĐI MUỘN (Dựa vào actualIn so với shiftStart)
            if (actualIn > shiftStart)
            {
                int lateMins = (int)(actualIn - shiftStart).TotalMinutes;
                if (lateMins > shift.AllowedLateMinutes)
                {
                    log.Status = AttendanceStatus.Late;
                    log.LateMinutes = lateMins;
                }
            }

            // 4.2 TÍNH PHÚT VỀ SỚM (Dựa vào actualOut so với shiftEnd)
            if (actualOut < shiftEnd)
            {
                int earlyMins = (int)(shiftEnd - actualOut).TotalMinutes;
                if (earlyMins > shift.AllowedEarlyLeaveMinutes)
                {
                    // Nếu đã dính trạng thái Đi muộn thì giữ nguyên Status là Late, nhưng vẫn ghi nhận số phút về sớm
                    if (log.Status != AttendanceStatus.Late)
                    {
                        log.Status = AttendanceStatus.EarlyLeave;
                    }
                    log.EarlyLeaveMinutes = earlyMins;
                }
            }

            // Đảm bảo không bao giờ bị số âm, làm tròn 2 chữ số thập phân
            log.WorkingHours = Math.Round(Math.Max(totalValidHours, 0), 2);

            // Logic xét Về Sớm (Early Leave)
            var allowedEarlyTime = shiftEnd.AddMinutes(-shift.AllowedEarlyLeaveMinutes);

            // Lưu ý: Dùng `actualOut` để xét về sớm, vì ta cần biết thực tế họ bước ra khỏi công ty lúc nào
            if (actualOut < allowedEarlyTime && log.Status != AttendanceStatus.Late)
            {
                log.Status = AttendanceStatus.EarlyLeave;
            }
        }
    }
}