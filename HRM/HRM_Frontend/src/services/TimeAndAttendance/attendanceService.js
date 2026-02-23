// src/services/TimeAndAttendance/attendanceService.js
import axiosClient from "@/lib/axiosClient";

const attendanceService = {
  // 1. Check-in
  checkIn: async (data) => {
    // data có thể chứa: note, latitude, longitude...
    return await axiosClient.post('/Attendance/check-in', data);
  },

  // 2. Check-out
  checkOut: async (data) => {
    return await axiosClient.post('/Attendance/check-out', data);
  },

  // 3. Lấy lịch sử (Dùng để kiểm tra trạng thái hôm nay)
  getMyHistory: async (month, year) => {
    return await axiosClient.get('/Attendance/my-history', { 
      params: { month, year } 
    });
  }
};

export default attendanceService;