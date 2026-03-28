import axiosClient from "@/lib/axiosClient";

const leaveBalanceService = {
  // 1. Lấy danh sách quỹ phép (hỗ trợ phân trang/lọc)
  getAllBalances: async (params) => {
    // Trích xuất year và leaveTypeId ra khỏi params để nhét vào URL Path
    // Mặc định leaveTypeId = 1 (Phép năm) nếu FE không truyền
    const { year, leaveTypeId = 1, ...queryParams } = params; 
    
    // Gọi đúng Route mới của Backend: /LeaveBalances/year/{year}/leavetype/{leaveTypeId}
    // Các tham số còn lại (như searchTerm, pageNumber) vẫn nằm trong queryParams
    return await axiosClient.get(`/LeaveBalances/year/${year}/leavetype/${leaveTypeId}`, { 
      params: queryParams 
    });
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
  },
  getMyBalance: async (year) => {
    return await axiosClient.get(`/Attendance/my-leave-balance/year/${year}`); 
  },
};

export default leaveBalanceService;