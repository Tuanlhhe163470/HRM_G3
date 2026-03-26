import axiosClient from "@/lib/axiosClient";

const positionService = {
  // Lấy danh sách tất cả vị trí/chức danh
  getAll: () => axiosClient.get("/Positions"),

  // Lấy chi tiết một vị trí theo ID
  getById: (id) => axiosClient.get(`/Positions/${id}`),

  // Tạo mới một vị trí (data bao gồm PositionName)
  create: (data) => axiosClient.post("/Positions", data),

  // Cập nhật thông tin vị trí (id và data bao gồm PositionID, PositionName)
  update: (id, data) => {
    // Đảm bảo payload gửi lên có chứa PositionID theo yêu cầu của Backend
    const payload = {
      ...data,
      positionID: id 
    };
    return axiosClient.put(`/Positions/${id}`, payload);
  },

  // Xóa một vị trí
  delete: (id) => axiosClient.delete(`/Positions/${id}`),
};

export default positionService;