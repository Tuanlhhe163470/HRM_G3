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
};

export default attendanceService;
