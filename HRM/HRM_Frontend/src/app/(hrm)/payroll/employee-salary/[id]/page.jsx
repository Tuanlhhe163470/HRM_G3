"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import employeeSalaryConfigService from '@/services/Payroll/employeeSalaryConfigService';
import employeeService from '@/services/Payroll/employeeService'; // IMPORT THÊM SERVICE NÀY
import EmployeeSalaryTable from '@/components/features/payroll/EmployeeSalaryTable';
import EmployeeSalaryFormModal from '@/components/Modal/EmployeeSalary/page';

export default function EmployeeSalarySetupPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = parseInt(params.id) || 1;

  const [configs, setConfigs] = useState([]);
  const [employeeName, setEmployeeName] = useState(""); // STATE LƯU TÊN NHÂN VIÊN
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- THÊM STATE TÌM KIẾM VÀ SẮP XẾP ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "name_asc", "name_desc", "amount_desc", "amount_asc"

  // --- LOGIC LỌC VÀ SẮP XẾP ---
  const filteredAndSortedConfigs = React.useMemo(() => {
    // 1. Lọc theo tên khoản lương (componentName)
    let result = configs.filter(item =>
      (item.componentName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sắp xếp
    result.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return (a.componentName || "").localeCompare(b.componentName || "");
        case "name_desc":
          return (b.componentName || "").localeCompare(a.componentName || "");
        case "amount_desc":
          return (b.amount || 0) - (a.amount || 0);
        case "amount_asc":
          return (a.amount || 0) - (b.amount || 0);
        case "newest":
        default:
          // Default: xếp mới nhất lên đầu (configID lớn nhất)
          return (b.configID || 0) - (a.configID || 0);
      }
    });

    return result;
  }, [configs, searchTerm, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Gọi API lấy cấu hình lương của nhân viên này
      const configData = await employeeSalaryConfigService.getByEmployeeId(employeeId);
      setConfigs(Array.isArray(configData) ? configData : []);

      // 2. Gọi API lấy thông tin nhân viên để lôi cái Tên ra
      try {
        const currentEmployee = await employeeService.getById(employeeId);
        if (currentEmployee) {
          setEmployeeName(currentEmployee.fullName);
        } else {
          setEmployeeName(`Nhân viên #${employeeId}`); // Fallback nếu không tìm thấy
        }
      } catch (err) {
        console.error("Không thể lấy tên nhân viên:", err);
        setEmployeeName(`Nhân viên #${employeeId}`); // Bỏ qua lỗi 403 vẫn cho hiển thị lương
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const handleSave = async (formData) => {
    try {
      await employeeSalaryConfigService.assignOrUpdate(formData);
      alert("Thiết lập thành công!");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("CHI TIẾT LỖI:", error);
      if (error.response) {
        alert(`Lỗi Backend: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Lỗi kết nối: Sai số Port hoặc Backend chưa chạy!");
      }
    }
  };

  const handleDelete = async (configId) => {
    if (window.confirm("Bạn có chắc chắn muốn gỡ khoản lương này?")) {
      await employeeSalaryConfigService.delete(configId);
      fetchData();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push('/payroll/payroll-processing')}
            className="text-blue-600 hover:underline text-sm mb-2 flex items-center font-medium"
          >
            &larr; Quay lại danh sách nhân viên
          </button>

          {/* HIỂN THỊ TÊN NHÂN VIÊN Ở ĐÂY */}
          <h1 className="text-2xl font-bold text-gray-800">
            Thiết lập lương - {employeeName || 'Đang tải...'}
          </h1>
        </div>
        <button
          onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 font-medium"
        >
          <span className="text-lg">+</span> Gán khoản lương
        </button>
      </div>

      {/* --- TOOLBAR: TÌM KIẾM & SẮP XẾP --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Tìm theo tên khoản lương..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap uppercase">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="newest">Mới nhất (Mặc định)</option>
            <option value="name_asc">Tên (A-Z)</option>
            <option value="name_desc">Tên (Z-A)</option>
            <option value="amount_desc">Số tiền (Cao - Thấp)</option>
            <option value="amount_asc">Số tiền (Thấp - Cao)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[300px]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : (
          <EmployeeSalaryTable
            data={filteredAndSortedConfigs}
            onEdit={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <EmployeeSalaryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedItem}
        employeeId={employeeId}
      />
    </div>
  );
}