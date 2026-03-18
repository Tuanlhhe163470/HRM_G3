import axiosClient from "@/lib/axiosClient";

const leaveBalanceService = {
  // 1. Lấy danh sách quỹ phép (hỗ trợ phân trang/lọc)
  getAllBalances: async (params) => {
    // params có thể chứa: pageNumber, pageSize, keyword, year...
    return await axiosClient.get("/LeaveBalances", { params });
  },

  // 2. HR Khởi tạo quỹ phép đầu năm cho toàn công ty
  generateBalances: async (payload) => {
    // payload: { year: 2026, defaultDays: 12, leaveTypeId: 1 }
    return await axiosClient.post("/LeaveBalances/generate", payload);
  },

  // 3. HR Điều chỉnh tay số phép cho một nhân viên cụ thể
  adjustBalance: async (id, payload) => {
    // payload: { newTotalDays: 15, reason: "Thưởng thâm niên" }
    return await axiosClient.put(`/LeaveBalances/${id}/adjust`, payload);
  }
};

export default leaveBalanceService;