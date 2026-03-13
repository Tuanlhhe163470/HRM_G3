import axiosClient from "@/lib/axiosClient";

const candidateService = {

  // Gửi thông tin ứng viên và JobID để lưu vào DB
  applyJob: (formData) => {
    return axiosClient.post("/Candidates/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  // Dành cho HR/Manager: Lấy danh sách ứng viên đã nộp cho các tin tuyển dụng 
  getAdminList: () => {
    // API này yêu cầu Header Authorization (Token)
    // axiosClient của bạn nên đã có cấu hình tự chèn Token vào Header
    return axiosClient.get("/Candidates/admin-list");
  },
  
  processCandidate: (id, action) => {
    return axiosClient.patch(`/Candidates/${id}/process?action=${action}`);
  },
};

export default candidateService;
