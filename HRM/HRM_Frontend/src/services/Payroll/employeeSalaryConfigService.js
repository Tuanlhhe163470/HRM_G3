import axios from 'axios';

// ĐẢM BẢO PORT LÀ 7167
const API_URL = 'https://localhost:7167/api/EmployeeSalaryConfigs'; 

const employeeSalaryConfigService = {
  getByEmployeeId: async (employeeId) => {
    const response = await axios.get(`${API_URL}/Employee/${employeeId}`);
    return response.data;
  },
  assignOrUpdate: async (data) => {
    const response = await axios.post(`${API_URL}/Assign`, data);
    return response.data;
  },
  delete: async (configId) => {
    const response = await axios.delete(`${API_URL}/${configId}`);
    return response.data;
  }
};

export default employeeSalaryConfigService;