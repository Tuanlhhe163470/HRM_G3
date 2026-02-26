import axiosClient from "@/lib/axiosClient";

const candidateService = {
  // Giao thức 1: Upload file CV vật lý lên server
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/Candidates/upload-cv", formData);
  },

  // Giao thức 2: Gửi thông tin ứng viên và JobID để lưu vào DB
  applyJob: async (data) => {
    return axiosClient.post("/Candidates/apply", data);
  },
};

export default candidateService;
