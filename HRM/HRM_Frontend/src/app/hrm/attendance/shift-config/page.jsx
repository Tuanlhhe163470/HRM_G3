'use client';

import React, { useState, useEffect } from 'react';
import shiftService from '@/services/TimeAndAttendance/shiftService'; 
import publicHolidayService from '@/services/TimeAndAttendance/publicHolidayService';

export default function ShiftConfigPage() {
  // ================= STATE QUẢN LÝ DỮ LIỆU =================
  const [loading, setLoading] = useState(true);
  
  // --- 1. STATE CHO SHIFT (CA LÀM VIỆC) ---
  const [shifts, setShifts] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEditingShift, setIsEditingShift] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    id: 0,
    shiftName: '',
    morningStart: '08:00',
    afternoonEnd: '17:30',
    allowedLateMinutes: 15,
    isActive: true
  });

  // --- 2. STATE CHO HOLIDAY (NGÀY LỄ) - ĐÃ BỔ SUNG LOGIC SỬA ---
  const [holidays, setHolidays] = useState([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isEditingHoliday, setIsEditingHoliday] = useState(false); // <--- MỚI: Trạng thái đang sửa
  const [holidayForm, setHolidayForm] = useState({
    holidayID: 0,       // Sửa id -> holidayID
    holidayName: '',    // Sửa name -> holidayName
    startDate: '',
    endDate: '',
    isRecurring: false
  });

  // ================= LOGIC LOAD DỮ LIỆU =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftRes, holidayRes] = await Promise.all([
        shiftService.getAll({ pageIndex: 1, pageSize: 100 }),
        publicHolidayService.getAll({ pageIndex: 1, pageSize: 20 })
      ]);

      // Xử lý Shift
      let shiftList = shiftRes?.data || shiftRes || [];
      setShifts(shiftList);

      // Xử lý Holiday
      let holidayList = holidayRes?.data || holidayRes || [];
      setHolidays(holidayList);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddShift = () => {
    setIsEditingShift(false);
    setShiftForm({ id: 0, shiftName: '', morningStart: '08:00', afternoonEnd: '17:30', allowedLateMinutes: 15, isActive: true });
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift) => {
    setIsEditingShift(true);
    setShiftForm({
      ...shift,
      morningStart: shift.morningStart?.substring(0, 5) || '08:00',
      afternoonEnd: shift.afternoonEnd?.substring(0, 5) || '17:30'
    });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      if (isEditingShift) {
        await shiftService.update(shiftForm.id, shiftForm);
      } else {
        const { id, ...dataToSend } = shiftForm;
        await shiftService.create(dataToSend);
      }
      setIsShiftModalOpen(false);
      fetchData();
      alert(isEditingShift ? "Cập nhật thành công!" : "Thêm mới thành công!");
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDeleteShift = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa ca làm việc này?')) {
      try {
        await shiftService.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi: " + error.message);
      }
    }
  };

  // ================= LOGIC HOLIDAY (ĐÃ CẬP NHẬT ĐẦY ĐỦ) =================
  
  const formatDateInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };
  // 1. Mở Modal Thêm Mới
  const handleOpenAddHoliday = () => {
    setIsEditingHoliday(false);
    setHolidayForm({ holidayID: 0, holidayName: '', startDate: '', endDate: '', isRecurring: false });
    setIsHolidayModalOpen(true);
  };

  // 2. Mở Modal Sửa (Điền sẵn dữ liệu cũ)
  const handleOpenEditHoliday = (holiday) => {
    setIsEditingHoliday(true);
    setHolidayForm({
      holidayID: holiday.holidayID,      // Lấy từ JSON: holidayID
      holidayName: holiday.holidayName,  // Lấy từ JSON: holidayName
      startDate: formatDateInput(holiday.startDate),
      endDate: formatDateInput(holiday.endDate),
      isRecurring: holiday.isRecurring
    });
    setIsHolidayModalOpen(true);
  };

  const handleHolidayDateChange = (e) => {
    const { name, value } = e.target;
    setHolidayForm(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'startDate' && !isEditingHoliday && !prev.endDate) {
        newData.endDate = value;
      }
      return newData;
    });
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (new Date(holidayForm.endDate) < new Date(holidayForm.startDate)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu!"); return;
    }

    try {
      if (isEditingHoliday) {
        // Update: Dùng holidayID
        await publicHolidayService.update(holidayForm.holidayID, holidayForm);
      } else {
        // Create: Bỏ holidayID
        const { holidayID, ...dataToSend } = holidayForm;
        await publicHolidayService.create(dataToSend);
      }
      setIsHolidayModalOpen(false);
      fetchData();
      alert(isEditingHoliday ? "Cập nhật thành công!" : "Thêm mới thành công!");
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (confirm("Xóa ngày lễ này?")) {
      try { await publicHolidayService.delete(id); fetchData(); } catch (e) { alert("Lỗi xóa: " + e.message); }
    }
  };

  const formatDateRange = (start, end) => {
    if (!start) return '';
    const s = new Date(start).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const e = new Date(end).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
    return s === e ? s : `${s} - ${e}`;
  };

  const formatTime = (time) => time?.substring(0, 5) || '--:--';

  // ================= RENDER GIAO DIỆN =================
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure your organization's work schedule, operational shifts, and public holidays.</p>
        </div>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-white">
          Global Policies
        </button>
      </div>

      {/* --- PHẦN 1: CA LÀM VIỆC --- */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">timer</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Work Shifts</h2>
          </div>
          <button onClick={handleOpenAddShift} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span> Add New Shift
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          

          {shifts.map((shift) => (
            <div key={shift.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Standard Shift</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{shift.shiftName}</h3>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleOpenEditShift(shift)} className="rounded p-1 text-slate-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDeleteShift(shift.id)} className="rounded p-1 text-slate-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-lg text-slate-400">schedule</span>
                  <span>{formatTime(shift.morningStart)} - {formatTime(shift.afternoonEnd)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-lg text-slate-400">history</span>
                  <span>Late Tolerance: <span className="font-medium text-slate-900 dark:text-white">{shift.allowedLateMinutes} mins</span></span>
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleOpenAddShift} className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-slate-400 transition-colors hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 dark:border-gray-700 dark:bg-slate-800/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-700">
              <span className="material-symbols-outlined text-2xl">add</span>
            </div>
            <span className="mt-3 font-medium">Create New Shift</span>
          </button>
        </div>
      </div>

      {/* --- PHẦN 2: PUBLIC HOLIDAYS (CÓ NÚT EDIT) --- */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">calendar_month</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Public Holidays</h2>
          </div>
          <button 
            onClick={handleOpenAddHoliday}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-white"
          >
            <span className="material-symbols-outlined text-lg">add</span> Add Holiday
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-gray-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Holiday Name</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold text-center">Recurring</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {holidays.length > 0 ? (
                holidays.map((holiday) => (
                  // Chú ý: Dùng holidayID làm key
                  <tr key={holiday.holidayID} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {/* 👉 HIỂN THỊ ĐÚNG TRƯỜNG: holidayName */}
                      {holiday.holidayName} 
                    </td>
                    <td className="px-6 py-4">
                      {formatDateRange(holiday.startDate, holiday.endDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {holiday.isRecurring ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEditHoliday(holiday)} className="text-slate-400 hover:text-blue-600">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button onClick={() => handleDeleteHoliday(holiday.holidayID)} className="text-slate-400 hover:text-red-600">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No holidays found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: SHIFT ================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{isEditingShift ? 'Edit Shift' : 'Add Shift'}</h3>
            <form onSubmit={handleSaveShift} className="space-y-4">
               <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input required className="w-full border rounded p-2" value={shiftForm.shiftName} onChange={e=>setShiftForm({...shiftForm, shiftName:e.target.value})}/>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <input type="time" required className="border rounded p-2" value={shiftForm.morningStart} onChange={e=>setShiftForm({...shiftForm, morningStart:e.target.value})}/>
                  <input type="time" required className="border rounded p-2" value={shiftForm.afternoonEnd} onChange={e=>setShiftForm({...shiftForm, afternoonEnd:e.target.value})}/>
               </div>
               <input type="number" className="w-full border rounded p-2" value={shiftForm.allowedLateMinutes} onChange={e=>setShiftForm({...shiftForm, allowedLateMinutes:e.target.value})}/>
               <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={()=>setIsShiftModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: HOLIDAY ================= */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              {isEditingHoliday ? 'Edit Public Holiday' : 'Add Public Holiday'}
            </h3>
            
            <form onSubmit={handleSaveHoliday} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Holiday Name</label>
                {/* 👉 INPUT DÙNG ĐÚNG BIẾN: holidayName */}
                <input required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g. Tet Holiday"
                  value={holidayForm.holidayName}
                  onChange={(e) => setHolidayForm({...holidayForm, holidayName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">From Date</label>
                  <input type="date" required name="startDate"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                    value={holidayForm.startDate}
                    onChange={handleHolidayDateChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">To Date</label>
                  <input type="date" required name="endDate"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({...holidayForm, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-slate-700/50">
                 <input type="checkbox" id="isRecurring" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={holidayForm.isRecurring}
                    onChange={(e) => setHolidayForm({...holidayForm, isRecurring: e.target.checked})}
                 />
                 <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Recurring every year?</label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {isEditingHoliday ? 'Save Changes' : 'Create Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}