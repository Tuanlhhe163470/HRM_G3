import { API_CONFIG } from "@/constants/apiConfig";

export const AUTH_URLS = {
  // Kết hợp Base URL với endpoint cụ thể
  LOGIN: `${API_CONFIG.BASE_URL}/api/Auth/login`,
  // Bạn có thể thêm các url khác tại đây
  LOGOUT: `${API_CONFIG.BASE_URL}/api/Auth/logout`,
};