import axios from 'axios';

const API_URL = 'https://localhost:7167/api/Employees'; // Kiểm tra lại port BE của bạn

const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
        let token = localStorage.getItem('token');
        if (token) {
            token = token.replace(/^"(.*)"$/, '$1');
            return { Authorization: `Bearer ${token}` };
        }
    }
    return {};
};

const employeeService = {
  getAll: async () => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default employeeService;