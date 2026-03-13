"use client";
import React, { useState, useEffect } from 'react';

const SalaryComponentFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    componentName: '',
    type: 'Income',         // Mặc định là Thu nhập
    amount: 0,
    isFixed: true,          // Hình thức tính (Số tiền cố định)
    isActive: true
  });

  // Nếu có initialData (tức là đang Sửa), thì đổ dữ liệu vào form
  useEffect(() => {
    if (initialData) {
      setFormData({
        componentName: initialData.componentName,
        type: initialData.type,
        amount: initialData.amount,
        isFixed: initialData.isFixed,
        isActive: initialData.isActive
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        componentName: '',
        type: 'Income',
        amount: 0,
        isFixed: true,
        isActive: true
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    // Lớp phủ nền mờ (Glassmorphism Overlay)
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      
      {/* Hộp Modal */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 w-full max-w-md p-7 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Chỉnh sửa khoản lương' : 'Thêm khoản lương mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Điền các thông tin chi tiết bên dưới để thiết lập thành phần lương.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoản lương</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Lương cơ bản, Phụ cấp ăn trưa..."
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
            />
          </div>

          {/* Type (Income/Deduction) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại khoản lương</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Income">Thu nhập (Earnings)</option>
              <option value="Deduction">Khấu trừ (Deductions)</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền mặc định (VNĐ)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Calculation Basis (IsFixed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình thức tính</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.isFixed ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isFixed: e.target.value === 'true' })}
            >
              <option value="true">Số tiền cố định</option>
              <option value="false">Biến đổi theo công / Công thức</option>
            </select>
          </div>

          {/* Toggle Switch: Is Active? */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Trạng thái hoạt động</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 shadow-sm"
            >
              Lưu cấu hình
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SalaryComponentFormModal;