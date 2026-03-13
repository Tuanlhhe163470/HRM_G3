"use client";

import React, { useEffect, useState } from 'react';
import salaryComponentService from '@/services/Payroll/salaryComponentService';
import SalaryComponentFormModal from '@/components/Modal/SalaryTable/page';
import SalaryComponentTable from '@/components/features/payroll/SalaryComponentTable';

export default function SalaryConfigPage() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [allComponents, setAllComponents] = useState([]); 
  const [displayData, setDisplayData] = useState([]);     
  const [loading, setLoading] = useState(true);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Hàm load dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await salaryComponentService.getAll();
      const sortedData = data.sort((a, b) => b.componentID - a.componentID);
      setAllComponents(sortedData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- STATE TÌM KIẾM & SẮP XẾP ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 

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

  // 3. Logic Tìm kiếm & Sắp xếp
  const filteredAndSortedData = React.useMemo(() => {
    let result = allComponents.filter(item =>
      (item.componentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return (a.componentName || '').localeCompare(b.componentName || '');
        case 'name_desc': return (b.componentName || '').localeCompare(a.componentName || '');
        case 'amount_asc': return (a.amount || 0) - (b.amount || 0);
        case 'amount_desc': return (b.amount || 0) - (a.amount || 0);
        case 'newest':
        default: return b.componentID - a.componentID;
      }
    });

    return result;
  }, [allComponents, searchTerm, sortBy]);

  // 4. Logic Phân trang
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);
    setDisplayData(currentItems);
  }, [filteredAndSortedData, currentPage]);

  // --- XỬ LÝ LƯU ---
  const handleSave = async (formData) => {
    try {
      if (modalMode === 'edit' && selectedItem) {
        await salaryComponentService.update(selectedItem.componentID, formData);
        alert("Cập nhật thành công!");
      } else if (modalMode === 'create') {
        await salaryComponentService.create(formData);
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchData();
      setCurrentPage(1);
    } catch (error) {
      console.error("Lưu thất bại", error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khoản lương này?")) {
      try {
        await salaryComponentService.delete(id);
        fetchData();
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
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cấu hình Lương & Phụ cấp</h1>
          <p className="text-gray-500 text-sm">Quản lý các thành phần lương trong hệ thống</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          <span className="text-xl font-bold">+</span> Thêm khoản mới
        </button>
      </div>

      {/* Thanh công cụ: Tìm kiếm & Sắp xếp */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm khoản lương..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="newest">Mới nhất</option>
            <option value="name_asc">Tên (A-Z)</option>
            <option value="name_desc">Tên (Z-A)</option>
            <option value="amount_desc">Số tiền (Cao - Thấp)</option>
            <option value="amount_asc">Số tiền (Thấp - Cao)</option>
          </select>
        </div>
      </div>

      {/* Nội dung bảng */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-2">
        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <SalaryComponentTable
            data={displayData}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalItems={filteredAndSortedData.length}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(filteredAndSortedData.length / itemsPerPage)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal nhập liệu */}
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