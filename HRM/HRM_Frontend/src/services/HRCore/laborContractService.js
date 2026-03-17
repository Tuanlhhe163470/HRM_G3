
import axiosClient from "@/lib/axiosClient";

const laborContractService = {
  getAll: (params) => axiosClient.get("/LaborContracts", { params }),
  getById: (id) => axiosClient.get(`/LaborContracts/${id}`),
  create: (data) => axiosClient.post("/LaborContracts", data),
  update: (id, data) => axiosClient.put(`/LaborContracts/${id}`, data), 
  delete: (id) => axiosClient.delete(`/LaborContracts/${id}`), 
  // API lấy thông tin từ Offer cũ
  prepareFromOffer: (candidateId) => 
    axiosClient.get(`/LaborContracts/prepare-from-offer/${candidateId}`),
    
  // API lấy danh sách nhân viên chưa có hợp đồng
  getEmployeesWithoutContract: () => 
    axiosClient.get("/LaborContracts/employees-without-contract"),
};

export default laborContractService;