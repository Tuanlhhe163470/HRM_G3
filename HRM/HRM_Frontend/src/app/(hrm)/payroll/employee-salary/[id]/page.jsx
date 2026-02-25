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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Gọi API lấy cấu hình lương của nhân viên này
      const configData = await employeeSalaryConfigService.getByEmployeeId(employeeId);
      setConfigs(Array.isArray(configData) ? configData : []);

      // 2. Gọi API lấy thông tin nhân viên để lôi cái Tên ra
      const employeesData = await employeeService.getAll();
      const currentEmployee = employeesData.find(emp => emp.employeeID === employeeId);
      
      if (currentEmployee) {
        setEmployeeName(currentEmployee.fullName);
      } else {
        setEmployeeName(`Nhân viên #${employeeId}`); // Fallback nếu không tìm thấy
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[300px]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : (
          <EmployeeSalaryTable 
            data={configs} 
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