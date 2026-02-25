import axios from 'axios';

const axiosClient = axios.create({
  // Lấy đường dẫn từ biến môi trường
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  if (config.url.toLowerCase().includes('login')) {
      return config;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});


axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
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