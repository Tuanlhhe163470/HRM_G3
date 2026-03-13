import axios from 'axios';

const API_URL = 'https://localhost:7167/api/Payroll';

// Hàm helper để lấy token từ localStorage
const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
        let token = localStorage.getItem('token');
        if (token) {
            // Dọn dẹp dấu ngoặc kép thừa (nếu có) ở đầu và cuối chuỗi Token
            token = token.replace(/^"(.*)"$/, '$1');
            
            // Bạn có thể mở comment dòng dưới để F12 xem Token gửi đi đã chuẩn chưa (bắt đầu bằng eyJ...)
            // console.log("Token chuẩn bị gửi đi:", token);

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
    },

    // --- PHẦN THÊM MỚI CHO NHÂN VIÊN XEM LƯƠNG ---
    getMySalary: (month, year) => {
        return axios.get(`${API_URL}/my-salary`, {
            params: { month, year },
            headers: getAuthHeaders()
        });
    },

    // Cộng dồn thêm điều chỉnh (hỗ trợ nhiều lần thưởng/phạt)
    addAdjustment: (id, amount, reason) => {
        return axios.post(`${API_URL}/${id}/adjust/add`, { amount, reason }, {
            headers: getAuthHeaders()
        });
    },
};