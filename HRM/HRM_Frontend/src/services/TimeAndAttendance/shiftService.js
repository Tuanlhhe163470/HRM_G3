// src/services/shiftService.js
import axiosClient from '@/lib/axiosClient';

const shiftService = {
  getAll: (params) => axiosClient.get('/ShiftConfig', { params }),
  create: (data) => axiosClient.post('/ShiftConfig', data),
  update: (id, data) => axiosClient.put(`/ShiftConfig/${id}`, data),
  delete: (id) => axiosClient.delete(`/ShiftConfig/${id}`),
};

export default shiftService;