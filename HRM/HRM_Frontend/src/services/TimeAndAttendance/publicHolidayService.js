import axiosClient from "@/lib/axiosClient";

const publicHolidayService = {
  // Lấy danh sách (có phân trang)
  getAll: async (params) => {
    return await axiosClient.get('/PublicHolidays', { params });
  },

  // Lấy chi tiết
  getById: async (id) => {
    return await axiosClient.get(`/PublicHolidays/${id}`);
  },

  // Thêm mới
  create: async (data) => {
    return await axiosClient.post('/PublicHolidays', data);
  },

  // Cập nhật
  update: async (id, data) => {
    return await axiosClient.put(`/PublicHolidays/${id}`, data);
  },

  // Xóa
  delete: async (id) => {
    return await axiosClient.delete(`/PublicHolidays/${id}`);
  }
};

export default publicHolidayService;