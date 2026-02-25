"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import employeeService from '@/services/Payroll/employeeService';

export default function PayrollProcessingPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getAll();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSetupSalary = (employeeId) => {
    router.push(`/payroll/employee-salary/${employeeId}`); 
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xử lý lương nhân viên</h1>
        <p className="text-sm text-gray-500 mt-1">Chọn một nhân viên để thiết lập lương và phụ cấp</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[300px]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Mã NV</th>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Họ và Tên</th>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length > 0 ? employees.map((emp) => (
                <tr key={emp.employeeID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">NV-{emp.employeeID.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{emp.fullName}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{emp.status || 'Active'}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button 
                      onClick={() => handleSetupSalary(emp.employeeID)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors text-xs font-medium border border-blue-200"
                    >
                      Thiết lập lương
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-10 text-gray-500">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}