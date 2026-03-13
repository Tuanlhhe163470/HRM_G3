import { AUTH_URLS } from "./urls";

export const loginApi = async (credentials) => {
  try {
    const response = await fetch(AUTH_URLS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đăng nhập thất bại!");
    }

    const data = await response.json();
    
    // Lưu token vào localStorage để dùng cho các request sau
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};