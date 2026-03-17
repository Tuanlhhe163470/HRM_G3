import axiosClient from "@/lib/axiosClient";

const overtimeService = {
  // 1. NHÂN VIÊN: Nộp đơn xin OT
  submitOvertime: async (payload) => {
    return await axiosClient.post("/Overtimes/request", payload);
  },

  // 2. NHÂN VIÊN: Lấy danh sách đơn OT của chính mình
  getMyOvertimes: async () => {
    return await axiosClient.get("/Overtimes/my-requests");
  },

  // 3. QUẢN LÝ / HR: Lấy danh sách đơn OT đang chờ duyệt
  getPendingOvertimes: async () => {
    return await axiosClient.get("/Overtimes/pending");
  },

  // 4. QUẢN LÝ / HR: Duyệt hoặc Từ chối đơn OT
  reviewOvertime: async (id, payload) => {
    return await axiosClient.put(`/Overtimes/${id}/review`, payload);
  }
};

export default overtimeService;