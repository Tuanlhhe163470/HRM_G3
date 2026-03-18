import axiosClient from "@/lib/axiosClient";

const explanationService = {
  submitExplanation: async (payload) => {
    // payload: { attendanceLogId, reason, expectedCheckInTime, expectedCheckOutTime }
    return await axiosClient.post("/Explanations", payload);
  },

  // 2. Lấy lịch sử giải trình cá nhân (GET /api/Explanations/my-requests)
  getMyExplanations: async () => {
    return await axiosClient.get("/Explanations/my-requests");
  },

  // 3. Lấy chi tiết một đơn giải trình (GET /api/Explanations/{id}) - 🌟 MỚI BỔ SUNG
  getExplanationById: async (id) => {
    return await axiosClient.get(`/Explanations/${id}`);
  },

  // 4. Lấy danh sách chờ duyệt cho Manager/HR (GET /api/Explanations/pending)
  getPendingExplanations: async () => {
    return await axiosClient.get("/Explanations/pending");
  },

  // 5. Gửi quyết định duyệt hoặc từ chối (PUT /api/Explanations/{id}/review)
  reviewExplanation: async (id, payload) => {
    // payload: { isApproved: true/false, note: "Lý do..." }
    return await axiosClient.put(`/Explanations/${id}/review`, payload);
  },
};

export default explanationService;