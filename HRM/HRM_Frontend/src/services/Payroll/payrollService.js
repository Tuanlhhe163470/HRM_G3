import axios from 'axios';

// Đảm bảo có URL đầy đủ của Backend
const API_URL = 'https://localhost:7167/api/payroll'; 

export const getMonthlyPayroll = (month, year) => {
    return axios.get(API_URL, { params: { month, year } });
};

export const calculatePayroll = (month, year) => {
    return axios.post(`${API_URL}/calculate`, { month, year });
};