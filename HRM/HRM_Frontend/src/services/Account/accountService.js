import axiosClient from "@/lib/axiosClient";

const accountService = {
  // 1. Lấy toàn bộ danh sách tài khoản hiện có (Admin CRUD)
  getAllAccounts: async () => {
    return await axiosClient.get("/Accounts");
  },

  // 2. Lấy danh sách nhân viên chưa có tài khoản trên hệ thống
  getEmployeesWithoutAccount: async () => {
    return await axiosClient.get("/Accounts/employees-without-account");
  },

  // 3. Tạo tài khoản mới cho một nhân viên cụ thể
  createAccount: async (data) => {
    return await axiosClient.post("/Accounts/create", data);
  },

  // 4. Xóa tài khoản vĩnh viễn (Admin không thể tự xóa chính mình - BE đã check)
  deleteAccount: async (id) => {
    return await axiosClient.delete(`/Accounts/${id}`);
  },

  // 5. Khóa hoặc Mở khóa tài khoản (Toggle status)
  toggleStatus: async (id) => {
    return await axiosClient.put(`/Accounts/toggle-status/${id}`);
  },

  // 6. Đổi mật khẩu cho tài khoản (Admin thực hiện hoặc User thực hiện tùy logic)
  changePassword: async (id, newPassword) => {
    return await axiosClient.put(`/Accounts/${id}/change-password`, {
      password: newPassword,
    });
  },

  // 7. Lấy danh sách các quyền (Roles) để đổ vào Select khi tạo tài khoản
  getRoles: async () => {
    return await axiosClient.get("/Roles");
  },
};

export default accountService;
