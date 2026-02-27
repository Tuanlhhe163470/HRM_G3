import axios from 'axios';

const API_URL = 'https://localhost:7167/api/Payroll';

// Hàm helper để lấy token từ localStorage
const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    }
    return {};
};

export const payrollService = {
    getMonthlyPayroll: (month, year) => {
        return axios.get(`${API_URL}/Monthly`, {
            params: { month, year },
            headers: getAuthHeaders()
        });
    },

    calculatePayroll: (month, year) => {
        return axios.post(`${API_URL}/Calculate`, { month, year }, {
            headers: getAuthHeaders()
        });
    },

    adjustPayroll: (id, amount, reason) => {
        return axios.put(`${API_URL}/${id}/adjust`, { amount, reason }, {
            headers: getAuthHeaders()
        });
    },

    approvePayroll: (id, isApproved, managerId) => {
        return axios.post(`${API_URL}/${id}/approve`, { isApproved, managerId }, {
            headers: getAuthHeaders()
        });
    }
};