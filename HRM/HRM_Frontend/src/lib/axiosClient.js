import axios from 'axios';

const axiosClient = axios.create({
  // Lấy đường dẫn từ biến môi trường
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Xử lý phản hồi (Response Interceptor)
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng data để đỡ phải gõ response.data.data ở nơi khác
    return response.data;
  },
  (error) => {
    // Xử lý lỗi cơ bản
    const message = error.response?.data?.message || error.message;
    // Log ra console để dev dễ debug
    console.error(`Axios Error: ${message}`);
    return Promise.reject(error);
  }
);

export default axiosClient;