import axios from 'axios';

const API_URL = 'https://localhost:7167/api/Employees'; // Kiểm tra lại port BE của bạn

const employeeService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
};

export default employeeService;