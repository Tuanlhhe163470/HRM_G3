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

namespace HRM_Application.Services.TimeAttendance
{
    public class MonthlyTimesheetService : IMonthlyTimesheetService
    {
        private readonly IMonthlyTimesheetRepository _monthlyTimesheetRepo;
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IMapper _mapper;

        public MonthlyTimesheetService(
            IMonthlyTimesheetRepository monthlyTimesheetRepo,
            IAttendanceRepository attendanceRepository,
            IMapper mapper)
        {
            _monthlyTimesheetRepo = monthlyTimesheetRepo;
            _attendanceRepository = attendanceRepository;
            _mapper = mapper;
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
    }
}
