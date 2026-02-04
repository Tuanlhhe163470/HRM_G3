// src/services/Payroll/salaryComponentService.js

import axios from 'axios'; // Hoặc đường dẫn tới file cấu hình axios của bạn

// URL API Backend (Đổi port nếu cần)
const API_URL = 'https://localhost:7167/api/SalaryComponents'; 

const salaryComponentService = {
  // 1. Lấy danh sách (Dùng API GetAll cho Admin)
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching components:", error);
      throw error;
    }
  },

  // 2. Tạo mới
  create: async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Cập nhật
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Xóa (Soft Delete)
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default salaryComponentService;