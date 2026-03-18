import axios from 'axios';

const API_URL = 'https://localhost:7167/api';

// Hàm helper để lấy token từ localStorage
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

export const reportService = {
    getInsuranceReport: (month, year) => {
        return axios.get(`${API_URL}/reports/insurance`, {
            params: { month, year },
            headers: getAuthHeaders()
        });
    },
    getTaxReport: (month, year) => {
        return axios.get(`${API_URL}/reports/tax`, {
            params: { month, year },
            headers: getAuthHeaders()
        });
    }
};