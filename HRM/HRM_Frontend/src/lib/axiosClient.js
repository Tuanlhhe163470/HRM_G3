import axios from 'axios';

const axiosClient = axios.create({
  // Lấy đường dẫn từ biến môi trường
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, 
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
    if (config.data instanceof FormData) {
      // Nếu là gửi file, hãy để trình duyệt tự quyết định Content-Type (kèm boundary)
      delete config.headers['Content-Type'];
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
    const message = error.response?.data?.message || error.message;
    console.error(`Axios Error: ${message}`);
    
    if (error.response?.status === 401) {
       console.warn("Token hết hạn hoặc không hợp lệ!");
       // typeof window !== 'undefined' && localStorage.removeItem('token');
       // typeof window !== 'undefined' && (window.location.href = '/login');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;