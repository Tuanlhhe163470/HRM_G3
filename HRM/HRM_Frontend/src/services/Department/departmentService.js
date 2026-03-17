import axiosClient from "@/lib/axiosClient";

const departmentService = {
  getAll: async (params) => {
    return await axiosClient.get("/Departments", { params });
  },
  getById: async (id) => {
    return await axiosClient.get(`/Departments/${id}`);
  },
  create: async (data) => {
    return await axiosClient.post("/Departments", data);
  },
  update: async (id, data) => {
    return await axiosClient.put(`/Departments/${id}`, data);
  },
  delete: async (id) => {
    return await axiosClient.delete(`/Departments/${id}`);
  },
  getEmployeesByDept: async (id) => {
    return await axiosClient.get(`/Departments/${id}/employees`);
  },
};

export default departmentService;