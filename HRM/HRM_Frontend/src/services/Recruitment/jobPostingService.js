import axiosClient from "@/lib/axiosClient";

const jobPostingService = {
  // 1. Lấy danh sách cho ứng viên (Tin đã đăng)
  getPublished: () => axiosClient.get("/JobPostings/published"),

  // 2. Tạo yêu cầu tuyển dụng mới
  create: (data) => axiosClient.post("/JobPostings", data),

  // 3. Manager phê duyệt/từ chối
  getPending: () => axiosClient.get("/JobPostings/pending-by-dept"),

  // 4. DÀNH CHO HR: Lấy tất cả tin để quản lý
  getAll: () => axiosClient.get("/JobPostings/all"),

  // 5. Thao tác phê duyệt & Công khai
  approve: (id, isApproved) =>
    axiosClient.patch(`/JobPostings/${id}/approve?isApproved=${isApproved}`),

  publish: (id, htmlContent) => {
    return axiosClient.patch(`/JobPostings/${id}/publish`, {
      description: htmlContent, 
    });
  },

  // 5. Mở lại và gia hạn tin (Sửa để khớp với ReopenJobRequest DTO)
  reopen: (id, date) => {
    return axiosClient.patch(`/JobPostings/${id}/reopen`, {
      newExpiryDate: date, 
    });
  },

  // 6. Cập nhật và Đóng tin
  update: (id, data) => axiosClient.put(`/JobPostings/${id}`, data),

  close: (id) => axiosClient.patch(`/JobPostings/${id}/close`),
};

export default jobPostingService;
