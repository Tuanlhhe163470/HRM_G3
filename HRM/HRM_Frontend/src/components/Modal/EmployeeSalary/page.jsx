"use client";
import React, { useState, useEffect } from 'react';
import salaryComponentService from '@/services/Payroll/salaryComponentService';

export default function EmployeeSalaryFormModal({ isOpen, onClose, onSave, initialData, employeeId }) {
  const [componentsMaster, setComponentsMaster] = useState([]);
  const [formData, setFormData] = useState({ componentID: '', amount: 0, effectiveDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (isOpen) {
      salaryComponentService.getAll().then(data => setComponentsMaster(data.filter(x => x.isActive)));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({ componentID: initialData.componentID, amount: initialData.amount, effectiveDate: initialData.effectiveDate.split('T')[0] });
    } else if (isOpen) {
      setFormData({ componentID: '', amount: 0, effectiveDate: new Date().toISOString().split('T')[0] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-7 w-full max-w-md animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{initialData ? 'Sửa khoản lương' : 'Thêm khoản lương'}</h2>
        <p className="text-sm text-gray-400 mb-5">{initialData ? 'Cập nhật số tiền cho khoản lương này.' : 'Gán một khoản lương mới cho nhân viên.'}</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ employeeID: employeeId, componentID: parseInt(formData.componentID), amount: parseFloat(formData.amount), effectiveDate: formData.effectiveDate });
        }}>
          <div className="mb-4">
            <label className="block text-sm mb-1">Khoản lương</label>
            <select required disabled={!!initialData} className="w-full border p-2 rounded" value={formData.componentID} onChange={(e) => {
              const comp = componentsMaster.find(c => c.componentID.toString() === e.target.value);
              setFormData({ ...formData, componentID: e.target.value, amount: comp ? comp.amount : 0 });
            }}>
              <option value="">-- Chọn --</option>
              {componentsMaster.map(c => <option key={c.componentID} value={c.componentID}>{c.componentName}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Số tiền (VNĐ)</label>
            <input type="number" required className="w-full border p-2 rounded" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}