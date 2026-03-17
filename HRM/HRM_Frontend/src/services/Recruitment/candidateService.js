import axiosClient from "@/lib/axiosClient";

const candidateService = {
  // 1. Gửi thông tin ứng viên và JobID (FormData kèm file CV)
  applyJob: (formData) => {
    return axiosClient.post("/Candidates/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 2. Dành cho HR/Manager: Lấy danh sách ứng viên (phân quyền theo Role)
  getAdminList: async () => {
    return await axiosClient.get("/Candidates/admin-list");
  },

  // 3. Lấy chi tiết 1 ứng viên để hiển thị ở Side Panel trang Lịch
  getById: async (id) => {
    return await axiosClient.get(`/Candidates/${id}`);
  },

  // 4. Xử lý trạng thái ứng viên (Screening, Reject, Manager_Review...)
  processCandidate: async (id, action) => {
    return await axiosClient.patch(
      `/Candidates/${id}/process?action=${action}`,
    );
  },

  // 5. Lấy toàn bộ danh sách phỏng vấn từ bảng Interviews để hiện lên Calendar
  getAllInterviews: async () => {
    return await axiosClient.get("/Candidates/all-interviews");
  },

  // 6. Gửi dữ liệu đặt lịch phỏng vấn và kích hoạt gửi Email từ BE
  scheduleInterview: async (data) => {
    return await axiosClient.post("/Candidates/schedule-interview", data);
  },

  //7. Đánh giá ứng viên sau phỏng vấn (điểm số, nhận xét, quyết định cuối cùng)
  evaluateCandidate: async (candidateId, evaluationData) => {
    return await axiosClient.post(`/Candidates/evaluate`, {
      candidateID: candidateId,
      score: evaluationData.score,
      comment: evaluationData.comment,
      finalDecision: evaluationData.finalDecision,
    });
  },

  // 8. Tạo Offer mới và gửi Email (Dành cho HR)
  createOffer: async (data) => {
    return await axiosClient.post("/Candidates/create-offer", data);
  },

  // 9. Xác nhận ứng viên trúng tuyển
  confirmHire: async (id) => {
    return await axiosClient.patch(`/Candidates/${id}/hire`);
  },

  // 10. Xác nhận từ chối (Truyền reason qua Body)
  declineOffer: async (id, reason) => {
    return await axiosClient.patch(
      `/Candidates/${id}/decline-offer`,
      JSON.stringify(reason),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};

export default candidateService;
