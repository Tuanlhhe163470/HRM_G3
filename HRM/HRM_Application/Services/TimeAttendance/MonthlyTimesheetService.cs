using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.MonthlyTimesheet;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRM_Domain.Enums;
using HRM_Domain.Entities;
using HRM_Application.Interfaces.Repositories;

namespace HRM_Application.Services.TimeAttendance
{
    public class MonthlyTimesheetService : IMonthlyTimesheetService
    {
        private readonly IMonthlyTimesheetRepository _monthlyTimesheetRepo;
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IShiftRepository _shiftRepo;
        private readonly ILeaveRequestRepository _leaveRepo;
        private readonly IOvertimeRequestRepository _otRepo;
        private readonly IAttendanceExplanationRepository _explanationRepo;
        private readonly IMapper _mapper;

        public MonthlyTimesheetService(IMonthlyTimesheetRepository monthlyTimesheetRepo, IAttendanceRepository attendanceRepository, IShiftRepository shiftRepo, ILeaveRequestRepository leaveRepo, IOvertimeRequestRepository otRepo, IAttendanceExplanationRepository explanationRepo, IMapper mapper)
        {
            _monthlyTimesheetRepo = monthlyTimesheetRepo;
            _attendanceRepository = attendanceRepository;
            _shiftRepo = shiftRepo;
            _leaveRepo = leaveRepo;
            _otRepo = otRepo;
            _explanationRepo = explanationRepo;
            _mapper = mapper;
        }

        // --- 2. HÀM CHÍNH: TỔNG HỢP CÔNG TOÀN CÔNG TY ---
        public async Task CalculateCompanyTimesheetAsync(int month, int year)
        {
            // =========================================================================
            // BƯỚC 1: CHUẨN BỊ MỐC DỮ LIỆU (BASE DATA)
            // =========================================================================
            var activeShifts = await _shiftRepo.GetActiveShiftAsync();
            if (activeShifts == null || !activeShifts.Any()) throw new Exception("Không có ca nào.");

            // 2.1 Kéo toàn bộ log chấm công của cả công ty trong tháng
            var allLogs = await _attendanceRepository.GetAllLogsByMonthAsync(month, year);
            var groupedByEmployee = allLogs.GroupBy(x => x.EmployeeId);

            // 2.2 Kéo toàn bộ OT đã duyệt và biến thành Dictionary trên RAM
            var allApprovedOTs = await _otRepo.GetApprovedOTByMonthAsync(month, year);

            // Tạo từ điển: Key là EmployeeId, Value là Tổng số giờ OT của người đó
            var otDictionary = allApprovedOTs
                .GroupBy(x => x.EmployeeId)
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(x => x.ApprovedHours)
                );

            var timesheetsToAdd = new List<MonthlyTimesheet>();
            var timesheetsToUpdate = new List<MonthlyTimesheet>();

            foreach (var group in groupedByEmployee)
            {
                int empId = group.Key;
                var logs = group.ToList();

                // tìm shiftId xuất hiện nhiều log trong tháng
                var dominantShiftId = logs
                    .Where(x => x.ShiftId > 0)
                    .GroupBy(x => x.ShiftId)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .FirstOrDefault();

                var employeeShift = activeShifts.FirstOrDefault(s => s.Id == dominantShiftId)
                     ?? activeShifts.First();

                decimal standardDays = GetStandardWorkDays(year, month, employeeShift.WorkDays);

                // 3.1 Tính toán Ngày công
                decimal actualWorkDays = logs.Count(x =>
                    x.Status == AttendanceStatus.OnTime ||
                    x.Status == AttendanceStatus.Late ||
                    x.Status == AttendanceStatus.EarlyLeave);

                decimal paidLeaveDays = logs.Count(x =>
                    x.Status == AttendanceStatus.Holiday ||
                    x.Status == AttendanceStatus.OnLeave);

                decimal loggedUnpaidLeave = logs.Count(x =>
                    x.Status == AttendanceStatus.Absent ||
                    x.Status == AttendanceStatus.MissingCheckOut);

                decimal totalAccountedDays = actualWorkDays + paidLeaveDays + loggedUnpaidLeave;
                decimal missingDays = standardDays - totalAccountedDays;
                decimal unpaidLeaveDays = loggedUnpaidLeave + Math.Max(missingDays, 0); // Dùng Math.Max cho Clean Code

                // 3.2 Tính toán Thời lượng & Vi phạm
                double totalHours = Math.Round(logs.Where(x =>
                    x.Status == AttendanceStatus.OnTime ||
                    x.Status == AttendanceStatus.Late ||
                    x.Status == AttendanceStatus.EarlyLeave)
                    .Sum(x => x.WorkingHours ?? 0), 2);

                int totalLateMins = logs.Sum(x => x.LateMinutes);
                int totalEarlyMins = logs.Sum(x => x.EarlyLeaveMinutes);

                // Nếu không có OT thì trả về 0, không bị lỗi Null
                double totalOtHours = otDictionary.GetValueOrDefault(empId, 0);

                // 3.3 Khớp nối với Bảng chốt công (Timesheet) hiện tại
                // Note cho tương lai: Chỗ này có thể nâng cấp tiếp thành Bulk Fetch để triệt tiêu N+1 hoàn toàn
                var existingRecord = await _monthlyTimesheetRepo.GetByEmployeeAndMonthAsync(empId, month, year);

                if (existingRecord != null)
                {
                    // Bảo vệ dữ liệu: Nếu HR đã khóa sổ thì hệ thống không được tự ý sửa
                    if (existingRecord.Status == TimesheetStatus.Locked) continue;

                    existingRecord.StandardWorkDays = standardDays;
                    existingRecord.ActualWorkDays = actualWorkDays;
                    existingRecord.PaidLeaveDays = paidLeaveDays;
                    existingRecord.UnpaidLeaveDays = unpaidLeaveDays;
                    existingRecord.TotalWorkingHours = totalHours;
                    existingRecord.TotalOvertimeHours = totalOtHours;
                    existingRecord.TotalLateMinutes = totalLateMins;
                    existingRecord.TotalEarlyLeaveMinutes = totalEarlyMins;

                    existingRecord.LastCalculatedDate = DateTime.Now;
                    existingRecord.Status = TimesheetStatus.Draft; // Luôn trả về Nháp nếu có biến động công

                    timesheetsToUpdate.Add(existingRecord);
                }
                else
                {
                    timesheetsToAdd.Add(new MonthlyTimesheet
                    {
                        EmployeeID = empId,
                        Month = month,
                        Year = year,
                        StandardWorkDays = standardDays,
                        ActualWorkDays = actualWorkDays,
                        PaidLeaveDays = paidLeaveDays,
                        UnpaidLeaveDays = unpaidLeaveDays,
                        TotalWorkingHours = totalHours,
                        TotalOvertimeHours = totalOtHours,
                        TotalLateMinutes = totalLateMins,
                        TotalEarlyLeaveMinutes = totalEarlyMins,
                        Status = TimesheetStatus.Draft,
                        LastCalculatedDate = DateTime.Now
                    });
                }
            }

            if (timesheetsToAdd.Any()) await _monthlyTimesheetRepo.AddRangeAsync(timesheetsToAdd);
            if (timesheetsToUpdate.Any()) await _monthlyTimesheetRepo.UpdateRangeAsync(timesheetsToUpdate);
        }

        public async Task<List<MonthlyTimesheetResponse>> GetCompanyTimesheetsAsync(int month, int year)
        {
            try
            {
                var rawData = await _monthlyTimesheetRepo.GetAllByMonthAsync(month, year);

                var responseList = _mapper.Map<List<MonthlyTimesheetResponse>>(rawData);

                var allLogs = await _attendanceRepository.GetAllLogsByMonthAsync(month, year);

                var logsByEmployee = allLogs.GroupBy(x => x.EmployeeId)
                                            .ToDictionary(g => g.Key, g => g.ToList());

                int daysInMonth = DateTime.DaysInMonth(year, month);

                foreach (var item in responseList)
                {
                    item.DailyStatuses = new Dictionary<int, string>();

                    var empLogs = logsByEmployee.ContainsKey(item.EmployeeID) ? logsByEmployee[item.EmployeeID] : new List<AttendanceLog>();

                    for (int day = 1; day <= daysInMonth; day++)
                    {
                        var logForDay = empLogs.FirstOrDefault(l => l.WorkDate.Day == day);

                        if (logForDay == null)
                        {
                            item.DailyStatuses.Add(day, "");
                        }
                        else
                        {
                            string uiStatus = logForDay.Status switch
                            {
                                AttendanceStatus.OnTime => "P",      // Present (Đi làm đúng giờ)
                                AttendanceStatus.Late => "L",        // Late (Đi muộn)
                                AttendanceStatus.EarlyLeave => "L",  // Về sớm (Cũng tính là L - Lỗi)
                                AttendanceStatus.Absent => "A",      // Absent (Vắng mặt)
                                AttendanceStatus.MissingCheckOut => "A", // Quên check-out (Phạt coi như Vắng)
                                AttendanceStatus.Holiday => "H",     // Holiday (Lễ tết)
                                AttendanceStatus.OnLeave => "V",
                                _ => ""
                            };

                            item.DailyStatuses.Add(day, uiStatus);
                        }
                    }
                }

                return responseList;
            }
            catch (AutoMapperMappingException ex)
            {
                var realError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                throw new Exception($"Lỗi AutoMapper: {realError}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi hệ thống khi tải ma trận chấm công: {ex.Message}");
            }
        }

        public async Task LockCompanyTimesheetAsync(int month, int year)
        {
            var records = await _monthlyTimesheetRepo.GetAllByMonthAsync(month, year);

            if (records == null || !records.Any())
            {
                throw new InvalidOperationException($"Chưa có dữ liệu chấm công tháng {month}/{year} để chốt. Vui lòng chạy tính toán trước!");
            }

            if (records.All(r => r.Status == TimesheetStatus.Locked))
            {
                throw new InvalidOperationException($"Dữ liệu tháng {month}/{year} đã được khóa sổ từ trước!");
            }

            var pendingExplanations = await _explanationRepo.GetPendingExplanationsAsync("HR", 0); // Tái sử dụng hàm lấy Pending
            var hasPendingExplanations = pendingExplanations.Any(x => x.AttendanceLog != null && x.AttendanceLog.WorkDate.Month == month && x.AttendanceLog.WorkDate.Year == year);

            if (hasPendingExplanations)
                throw new InvalidOperationException($"Không thể khóa sổ! Vẫn còn Đơn Giải trình của tháng {month} đang chờ duyệt.");

            // 2. Kiểm tra đơn Xin nghỉ (Leave)
            var pendingLeaves = await _leaveRepo.GetPendingRequestsAsync();
            DateTime firstDay = new DateTime(year, month, 1);
            DateTime lastDay = firstDay.AddMonths(1).AddDays(-1);

            var hasPendingLeaves = pendingLeaves.Any(x => x.StartDate.Date <= lastDay.Date && x.EndDate.Date >= firstDay.Date);
            if (hasPendingLeaves)
                throw new InvalidOperationException($"Không thể khóa sổ! Vẫn còn Đơn Xin nghỉ phép liên quan đến tháng {month} đang chờ duyệt.");

            // 3. Kiểm tra đơn Làm thêm (Overtime)
            var pendingOTs = await _otRepo.GetPendingRequestsAsync();
            var hasPendingOTs = pendingOTs.Any(x => x.Date.Month == month && x.Date.Year == year);

            if (hasPendingOTs)
                throw new InvalidOperationException($"Không thể khóa sổ! Vẫn còn Đơn Làm thêm giờ (OT) của tháng {month} đang chờ duyệt.");

            // 4. Khóa sổ toàn bộ
            foreach (var record in records)
            {
                record.Status = TimesheetStatus.Locked;
                // Có thể lưu thêm: record.LockedBy = hrUserId; record.LockedAt = DateTime.Now; (Nếu Entity của bạn có)
            }

            await _monthlyTimesheetRepo.UpdateRangeAsync(records);
        }

        // Tính "Ngày công chuẩn" ĐỘNG dựa trên cấu hình Ca làm việc ---
        private decimal GetStandardWorkDays(int year, int month, string workDaysConfig)
        {
            if (string.IsNullOrEmpty(workDaysConfig)) return 0;
            var allowedDays = workDaysConfig.Split(',').Select(d => (DayOfWeek)int.Parse(d)).ToList();

            int daysToCalculate = DateTime.DaysInMonth(year, month);
            if (year == DateTime.Now.Year && month == DateTime.Now.Month)
            {
                daysToCalculate = DateTime.Now.Day;
            }

            int workDays = 0;
            for (int i = 1; i <= daysToCalculate; i++) 
            {
                DateTime date = new DateTime(year, month, i);
                if (allowedDays.Contains(date.DayOfWeek))
                {
                    workDays++;
                }
            }
            return workDays;
        }
    }
}
