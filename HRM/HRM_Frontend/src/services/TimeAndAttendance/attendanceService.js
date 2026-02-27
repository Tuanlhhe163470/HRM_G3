// src/services/TimeAndAttendance/attendanceService.js
import axiosClient from "@/lib/axiosClient";

const attendanceService = {
  // 1. Check-in
  checkIn: async (data) => {
    // data có thể chứa: note, latitude, longitude...
    return await axiosClient.post("/Attendance/check-in", data);
  },

  // 2. Check-out
  checkOut: async (data) => {
    return await axiosClient.post("/Attendance/check-out", data);
  },

  // 3. Lấy lịch sử (Dùng để kiểm tra trạng thái hôm nay)
  getMyHistory: async (month, year) => {
    return await axiosClient.get("/Attendance/my-history", {
      params: { month, year },
    });
  },
  // Nộp đơn giải trình
  submitExplanation: async (payload) => {
    return await axiosClient.post("/explanations", payload);
  },

  // Lấy lịch sử giải trình
  getMyExplanations: async () => {
    return await axiosClient.get("/explanations/my-requests");
  },

  // Lấy danh sách chờ duyệt (đã bóc tách logic theo Role ở Backend)
  getPendingExplanations: async () => {
    return await axiosClient.get("/explanations/pending");
  },

  // Gửi quyết định duyệt hoặc từ chối
  reviewExplanation: async (id, payload) => {
    // payload: { isApproved: true/false, note: "Lý do..." }
    return await axiosClient.put(`/explanations/${id}/review`, payload);
  },

  getMyBalances: async (year) => {
    const response = await axiosClient.get(`/leaves/my-balances?year=${year}`);
    return response; 
  },

  getLeaveTypes: async () => {
    const response = await axiosClient.get('/leaves/types');
    return response;
  },

  // Nộp đơn xin nghỉ
  submitLeaveRequest: async (payload) => {
    const response = await axiosClient.post('/leaves/request', payload);
    return response;
  },
  getMyLeaveRequests: async () => {
    const response = await axiosClient.get('/leaves/my-requests');
    return response;
  },
  // Lấy danh sách đơn xin nghỉ phép đang chờ duyệt (Backend đã tự động lọc theo Role)
  getPendingLeaveRequests: async () => {
    const response = await axiosClient.get('/leaves/pending');
    return response;
  },

  // Manager/HR gửi quyết định Duyệt hoặc Từ chối đơn nghỉ phép
  reviewLeaveRequest: async (id, payload) => {
    const response = await axiosClient.put(`/leaves/${id}/review`, payload);
    return response;
  }
};

export default attendanceService;
