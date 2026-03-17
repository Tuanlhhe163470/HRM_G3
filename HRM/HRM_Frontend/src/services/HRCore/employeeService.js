import axiosClient from "@/lib/axiosClient";

const employeeService = {
  // Lấy danh sách nhân viên phân trang
  getAll: (params) => axiosClient.get("/Employees", { params }),
  
  //Lấy theo phòng ban
  getByDepartment: async (deptId, params) => {
    const res = await axiosClient.get(`/Employees/ByDepartment/${deptId}`, { params });
    return res.data; 
  },

  // Lấy chi tiết nhân viên
  getById: (id) => axiosClient.get(`/Employees/${id}`),
  
  // Cập nhật thông tin
  update: (id, data) => axiosClient.put(`/Employees/${id}`, data),
  
  // Xóa nhân viên
  delete: (id) => axiosClient.delete(`/Employees/${id}`),
};

export default employeeService;