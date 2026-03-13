"use client";
import React, { useState, useEffect } from 'react';
import { payrollService } from '@/services/Payroll/payrollService';
import MyPayrollTable from '@/components/features/payroll/MyPayrollTable';

export default function MyPayrollPage() {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Lấy tên nhân viên từ localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setEmployeeName(userObj.fullName || userObj.name || userObj.email || '');
      }
    } catch (e) { /* ignore */ }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getMySalary(params.month, params.year);
      setPayroll(res.data);
    } catch (err) {
      setPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Phiếu lương chi tiết</h1>
          <p className="text-gray-500 text-sm italic">Chào bạn, đây là thông tin thu nhập minh bạch của bạn trong tháng.</p>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={params.month}
            onChange={(e) => setParams({ ...params, month: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
          >
            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
          </select>
          <input
            type="number"
            value={params.year}
            onChange={(e) => setParams({ ...params, year: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm font-bold w-24"
          />
        </div>
      </div>

      <MyPayrollTable data={payroll} loading={loading} employeeName={employeeName} />

      <div className="mt-6 text-[12px] text-gray-400 text-right uppercase tracking-widest">
        Dữ liệu được trích xuất từ hệ thống quản trị nhân sự HRM
      </div>
    </div>
  );
}