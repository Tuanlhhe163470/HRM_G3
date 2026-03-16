// src/services/SalaryAdvance/advanceService.js
import axios from 'axios';

const API_URL = 'https://localhost:7167/api/SalaryAdvance'; // Đổi lại đúng cổng của bạn

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

export const advanceService = {
    // 1. Dành cho Nhân viên
    requestAdvance: (data) => axios.post(`${API_URL}/request`, data, { headers: getAuthHeaders() }),
    getMyHistory: () => axios.get(`${API_URL}/my-history`, { headers: getAuthHeaders() }),
    
    // 2. Dành cho Quản lý
    getPendingRequests: () => axios.get(`${API_URL}/pending`, { headers: getAuthHeaders() }),
    getAllRequests: () => axios.get(`${API_URL}/all`, { headers: getAuthHeaders() }), // Toàn bộ lịch sử
    processRequest: (id, data) => axios.post(`${API_URL}/${id}/process`, data, { headers: getAuthHeaders() })
};