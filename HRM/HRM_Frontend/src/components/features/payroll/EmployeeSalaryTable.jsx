"use client";
import React from 'react';

// Khởi tạo các Icon bằng SVG
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

const EmployeeSalaryTable = ({ data = [], onEdit, onDelete }) => {
  const safeData = Array.isArray(data) ? data : [];

  // Hàm format ngày (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Tên khoản lương</th>
                  <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Số tiền</th>
                  <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Ngày áp dụng</th>
                  <th className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeData.length > 0 ? (
                  safeData.map((item) => (
                    <tr key={item.configID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.componentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type === 'Income' ? 'Thu nhập' : 'Khấu trừ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {item.amount?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.effectiveDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {/* Thay đổi phần Thao tác thành Icon */}
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => onEdit(item)} 
                            className="text-blue-500 hover:text-blue-700 transition-colors hover:scale-110" 
                            title="Sửa"
                          >
                            <EditIcon />
                          </button>
                          <button 
                            onClick={() => onDelete(item.configID)} 
                            className="text-red-500 hover:text-red-700 transition-colors hover:scale-110" 
                            title="Xóa"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                      Nhân viên này chưa được thiết lập khoản lương nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryTable;