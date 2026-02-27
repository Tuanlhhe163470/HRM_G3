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

  // --- STATE TÌM KIẾM & SẮP XẾP ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'name_asc', 'name_desc', 'amount_asc', 'amount_desc'

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

  // 3. Logic Tìm kiếm & Sắp xếp (Áp dụng lên toàn bộ data trước khi phân trang)
  const filteredAndSortedData = React.useMemo(() => {
    // Lọc theo tên
    let result = allComponents.filter(item =>
      (item.componentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sắp xếp
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

  // 4. Logic Phân trang (Cắt mảng dữ liệu ĐÃ LỌC & SẮP XẾP)
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);
    setDisplayData(currentItems);
  }, [filteredAndSortedData, currentPage]);

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

      {/* Toolbar: Tìm kiếm & Sắp xếp */}
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
            totalItems={filteredAndSortedData.length}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(filteredAndSortedData.length / itemsPerPage)}
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