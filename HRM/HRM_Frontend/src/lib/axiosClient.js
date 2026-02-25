import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- PHẦN KẾT HỢP MỚI: TỰ ĐỘNG ĐÍNH KÈM TOKEN ---
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage 
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- PHẦN XỬ LÝ PHẢN HỒI (RESPONSE) ---
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Nếu gặp lỗi 401 (Hết hạn hoặc sai Token)
    if (error.response && error.response.status === 401) {
      console.error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;