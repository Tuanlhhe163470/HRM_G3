import axiosClient from "@/lib/axiosClient";

const jobPostingService = {
  // 1. Lấy danh sách cho ứng viên (Tin đã đăng)
  getPublished: () => {
    return axiosClient.get("/JobPostings/published");
  },

  // 2. Tạo yêu cầu tuyển dụng mới (Mặc định Status = Pending)
  create: (data) => {
    return axiosClient.post("/JobPostings", data);
  },

  // 3. Manager phê duyệt/từ chối
  approve: (id, isApproved) => {
    return axiosClient.patch(`/JobPostings/${id}/approve?isApproved=${isApproved}`);
  },

  // 4. HR Công khai tin đăng sau khi đã Approved
  publish: (id, description) => {
    return axiosClient.patch(`/JobPostings/${id}/publish`, description);
  },

  // 5. Cập nhật và Đóng tin
  update: (id, data) => {
    return axiosClient.put(`/JobPostings/${id}`, data);
  },
  
  close: (id) => {
    return axiosClient.patch(`/JobPostings/${id}/close`);
  }
};

export default jobPostingService;