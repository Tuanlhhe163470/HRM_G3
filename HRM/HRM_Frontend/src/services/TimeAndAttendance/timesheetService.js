// src/services/TimeAndAttendance/timesheetService.js
import axiosClient from "@/lib/axiosClient";

const timesheetService = {
  getCompanyTimesheets: async (month, year) => {
    return await axiosClient.get('/Timesheet/company-master', {
      params: { month, year }
    });
  },

  // 2. Chạy cỗ máy tổng hợp (Re-Calculate)
  calculateTimesheets: async (month, year) => {
    return await axiosClient.post('/Timesheet/calculate', null, {
      params: { month, year }
    });
  }
};

export default timesheetService;