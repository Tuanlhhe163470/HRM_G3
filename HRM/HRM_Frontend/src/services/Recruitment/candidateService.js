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
    return await axiosClient.patch(`/Candidates/${id}/process?action=${action}`);
  },

  // 5. Lấy toàn bộ danh sách phỏng vấn từ bảng Interviews để hiện lên Calendar
  getAllInterviews: async () => {
    return await axiosClient.get("/Candidates/all-interviews");
  },

  // 6. Gửi dữ liệu đặt lịch phỏng vấn và kích hoạt gửi Email từ BE
  scheduleInterview: async (data) => {
    return await axiosClient.post("/Candidates/schedule-interview", data);
  }
};

export default candidateService;