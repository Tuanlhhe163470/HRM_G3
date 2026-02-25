"use client";

import React, { useEffect, useState } from 'react';
import salaryComponentService from '@/services/Payroll/salaryComponentService';
import SalaryComponentFormModal from '@/components/Modal/SalaryTable/page';
import SalaryComponentTable from '@/components/features/payroll/SalaryComponentTable';

export default function SalaryConfigPage() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [allComponents, setAllComponents] = useState([]); // Chứa toàn bộ dữ liệu từ API
  const [displayData, setDisplayData] = useState([]);     // Chứa dữ liệu hiển thị trên trang hiện tại
  const [loading, setLoading] = useState(true);
  
  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số dòng trên 1 trang (có thể chỉnh thành 10 tùy ý)

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // Các chế độ: 'create', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Hàm load dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await salaryComponentService.getAll();
      // Sắp xếp ID giảm dần (mới nhất lên đầu)
      const sortedData = data.sort((a, b) => b.componentID - a.componentID);
      setAllComponents(sortedData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Logic Phân trang (Cắt mảng dữ liệu dựa theo trang hiện tại)
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allComponents.slice(indexOfFirstItem, indexOfLastItem);
    setDisplayData(currentItems);
  }, [allComponents, currentPage]);

  // --- CÁC HÀM MỞ MODAL ---
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedItem(null); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item); 
    setIsModalOpen(true);
  };

  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedItem(item); 
    setIsModalOpen(true);
  };

  // --- XỬ LÝ LƯU (Create hoặc Update) ---
  const handleSave = async (formData) => {
    try {
      if (modalMode === 'edit' && selectedItem) {
        // Gọi API Update
        await salaryComponentService.update(selectedItem.componentID, formData);
        alert("Cập nhật thành công!");
      } else if (modalMode === 'create') {
        // Gọi API Create
        await salaryComponentService.create(formData);
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false); // Đóng modal
      fetchData(); // Load lại toàn bộ dữ liệu
      setCurrentPage(1); // Quay về trang 1
    } catch (error) {
      console.error("Save failed", error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khoản lương này?")) {
      try {
        await salaryComponentService.delete(id);
        fetchData();
        
        // Nếu xóa dòng cuối cùng của trang hiện tại, lùi về trang trước
        if (displayData.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
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
      <div className="bg-white rounded-lg shadow border border-gray-100 p-2">
        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <SalaryComponentTable 
            data={displayData} 
            onView={handleOpenView}
            onEdit={handleOpenEdit} 
            onDelete={handleDelete} 
            // Props cho phân trang
            currentPage={currentPage}
            totalItems={allComponents.length}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(allComponents.length / itemsPerPage)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Form */}
      <SalaryComponentFormModal 
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedItem}
      />
    </div>
  );
}