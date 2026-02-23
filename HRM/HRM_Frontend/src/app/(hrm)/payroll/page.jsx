"use client";

import React, { useEffect, useState } from 'react';
import salaryComponentService from '@/services/Payroll/salaryComponentService';
import SalaryComponentFormModal from '@/components/Modal/SalaryTable/page';
import SalaryComponentTable from '@/components/features/payroll/SalaryComponentTable';

export default function SalaryConfigPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Lưu item đang sửa (nếu có)

  // Hàm load dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await salaryComponentService.getAll();
      setComponents(data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý mở Modal THÊM MỚI
  const handleOpenCreate = () => {
    setEditingItem(null); // Reset item đang sửa về null
    setIsModalOpen(true);
  };

  // Xử lý mở Modal SỬA
  const handleOpenEdit = (item) => {
    setEditingItem(item); // Gán item cần sửa
    setIsModalOpen(true);
  };

  // Xử lý LƯU (Create hoặc Update)
  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        // Gọi API Update
        await salaryComponentService.update(editingItem.componentID, formData);
        alert("Cập nhật thành công!");
      } else {
        // Gọi API Create
        await salaryComponentService.create(formData);
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false); // Đóng modal
      fetchData(); // Load lại bảng
    } catch (error) {
      console.error("Save failed", error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  // Xử lý XÓA
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa khoản lương này?")) {
      try {
        await salaryComponentService.delete(id);
        fetchData();
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Page */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cấu hình lương & Phụ cấp</h1>
          <p className="text-gray-500 text-sm">Quản lý các thành phần lương trong hệ thống</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          <span className="text-xl font-bold">+</span> Thêm khoản mới
        </button>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <SalaryComponentTable 
            data={components} 
            onEdit={handleOpenEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}

      {/* Modal Form */}
      <SalaryComponentFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
}