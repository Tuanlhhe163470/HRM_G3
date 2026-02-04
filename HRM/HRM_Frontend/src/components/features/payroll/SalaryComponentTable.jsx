"use client";
import React, { useState, useEffect } from 'react';

const SalaryComponentFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    componentName: '',
    type: 'Income',         // Mặc định là Thu nhập (Earnings)
    amount: 0,
    isFixed: true,          // Calculation Basis (Fixed Amount)
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
    // Lớp phủ nền đen mờ (Overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
      
      {/* Hộp Modal Trắng */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Edit Salary Component' : 'Add New Salary Component'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill out the details below to add a new salary component.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Base Salary"
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
            />
          </div>

          {/* Type (Earnings/Deductions) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Income">Earnings (Thu nhập)</option>
              <option value="Deduction">Deductions (Khấu trừ)</option>
            </select>
          </div>

          {/* Amount (Thêm vào vì Backend cần) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Amount</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Calculation Basis (IsFixed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Basis</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.isFixed ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isFixed: e.target.value === 'true' })}
            >
              <option value="true">Fixed Amount (Cố định)</option>
              <option value="false">Variable / Formula (Biến đổi)</option>
            </select>
          </div>

          {/* Toggle Switch: Is Active? */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Is Active?</span>
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 shadow-sm"
            >
              Save Component
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SalaryComponentFormModal;