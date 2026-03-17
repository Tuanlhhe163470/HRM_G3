'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import shiftService from '@/services/TimeAndAttendance/shiftService';
import publicHolidayService from '@/services/TimeAndAttendance/publicHolidayService';
import useNotice from '@/components/Notice';

// Constant đưa ra ngoài component để tránh bị re-create mỗi lần render
const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ Nhật' },
];

export default function ShiftConfigPage() {
  const notice = useNotice();

  /**
   * ==========================================
   * 1. STATE MANAGEMENT
   * ==========================================
   */
  const [loading, setLoading] = useState(true);

  // --- States: Ca làm việc (Shifts) ---
  const [shifts, setShifts] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEditingShift, setIsEditingShift] = useState(false);
  const [shiftErrors, setShiftErrors] = useState({});

  // Ghi chú: Đã xóa state `selectedDays` thừa vì bạn đã lưu nó trong `shiftForm.workDays`
  const [shiftForm, setShiftForm] = useState({
    id: 0,
    shiftName: '',
    startTime: '08:00',
    endTime: '17:30',
    breakStartTime: '12:00',
    breakEndTime: '13:30',
    allowedLateMinutes: 15,
    allowedEarlyLeaveMinutes: 15,
    isActive: true,
    workDays: [1, 2, 3, 4, 5]
  });


  // --- States: Ngày lễ (Holidays) ---
  const [holidays, setHolidays] = useState([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isEditingHoliday, setIsEditingHoliday] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    id: 0,
    holidayName: '',
    startDate: '',
    endDate: '',
    isRecurring: false
  });

  /**
   * ==========================================
   * 2. DATA INITIALIZATION
   * Lấy song song cả 2 API để giảm thời gian chờ (Promise.all)
   * ==========================================
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftRes, holidayRes] = await Promise.all([
        shiftService.getAll({ pageIndex: 1, pageSize: 100 }),
        publicHolidayService.getAll({ pageIndex: 1, pageSize: 20 })
      ]);

      setShifts(shiftRes?.data || shiftRes || []);
      setHolidays(holidayRes?.data || holidayRes || []);
    } catch (error) {
      console.error("[ShiftConfig] Fetch error:", error);
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không thể tải cấu hình chấm công. Vui lòng tải lại trang.",
        isSuccess: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * ==========================================
   * 3. SHIFT MANAGEMENT HANDLERS (CA LÀM VIỆC)
   * ==========================================
   */
  const toggleDay = (dayValue) => {
    setShiftForm(prev => {
      const currentDays = prev.workDays || [];
      if (currentDays.includes(dayValue)) {
        return { ...prev, workDays: currentDays.filter(d => d !== dayValue) };
      }
      return { ...prev, workDays: [...currentDays, dayValue].sort() };
    });
  };

  const handleOpenAddShift = () => {
    setIsEditingShift(false);
    setShiftErrors({});
    setShiftForm({
      id: 0,
      shiftName: '',
      startTime: '08:00',
      endTime: '17:30',
      breakStartTime: '12:00',
      breakEndTime: '13:30',
      allowedLateMinutes: 15,
      allowedEarlyLeaveMinutes: 15,
      isActive: true,
      workDays: [1, 2, 3, 4, 5]
    });
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift) => {
    setIsEditingShift(true);
    setShiftErrors({});
    setShiftForm({
      ...shift,
      // Đảm bảo parse đúng format thời gian HH:mm để nhét vào input type="time"
      startTime: shift.startTime?.substring(0, 5) || '08:00',
      endTime: shift.endTime?.substring(0, 5) || '17:30',
      breakStartTime: shift.breakStartTime?.substring(0, 5) || '',
      breakEndTime: shift.breakEndTime?.substring(0, 5) || '',
      allowedEarlyLeaveMinutes: shift.allowedEarlyLeaveMinutes || 0,
      workDays: shift.workDays || []
    });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!shiftForm.shiftName || !shiftForm.shiftName.trim()) {
      errors.shiftName = 'Tên ca làm việc là bắt buộc.';
    }
    // Bạn có thể thêm validate cho giờ bắt đầu/kết thúc nếu muốn:
    if (!shiftForm.startTime) errors.startTime = 'Giờ bắt đầu là bắt buộc.';
    if (!shiftForm.endTime) errors.endTime = 'Giờ kết thúc là bắt buộc.';

    // Nếu có lỗi thì set state và dừng lại (không gọi API)
    if (Object.keys(errors).length > 0) {
      setShiftErrors(errors);
      return;
    }

    setShiftErrors({});
    try {
      if (isEditingShift) {
        await shiftService.update(shiftForm.id, shiftForm);
      } else {
        const { id, ...dataToSend } = shiftForm;
        await shiftService.create(dataToSend);
      }

      setIsShiftModalOpen(false);
      fetchData();
      notice({
        msg: isEditingShift ? "Cập nhật ca làm việc thành công" : "Tạo ca làm việc thành công",
        desc: `Ca "${shiftForm.shiftName}" đã được lưu vào hệ thống.`,
        isSuccess: true
      });
    } catch (error) {
      // 🌟 XỬ LÝ LỖI TRẢ VỀ TỪ BACKEND
      const responseData = error.response?.data;

      // 1. Nếu là lỗi Validation từ DTO (HTTP 400 - có object 'errors')
      if (error.response?.status === 400 && responseData?.errors) {
        const backendErrors = responseData.errors;
        const formattedErrors = {};

        // Convert Key từ PascalCase (Backend) sang camelCase (Frontend)
        // Ví dụ: "BreakStartTime" -> "breakStartTime"
        Object.keys(backendErrors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          // Backend trả về mảng lỗi (có thể nhiều lỗi cho 1 trường), ta lấy lỗi đầu tiên [0]
          formattedErrors[camelKey] = backendErrors[key][0];
        });

        setShiftErrors(formattedErrors); // Đập vào state để UI hiện màu đỏ
        notice({
          msg: "Dữ liệu không hợp lệ",
          desc: "Vui lòng kiểm tra lại các trường báo đỏ trên form.",
          isSuccess: false
        });
      }
      // 2. Lỗi Nghiệp vụ từ Service (Trùng tên ca...)
      else if (responseData?.message || responseData?.Message) {
        const errorMsg = responseData.message || responseData.Message;

        // 🌟 SỬA Ở ĐÂY: Đập thẳng errorMsg vào tham số `msg`
        notice({
          msg: errorMsg, // Chữ sẽ hiện to và rõ ràng trên Popup
          isSuccess: false
        });

        // (Tùy chọn UX) Tô đỏ ô nhập Tên ca
        if (errorMsg.toLowerCase().includes("tồn tại")) {
          setShiftErrors(prev => ({ ...prev, shiftName: errorMsg }));
        }
      }
      // 3. Lỗi Server 500 hoặc mất mạng
      else {
        notice({
          msg: "Lỗi hệ thống",
          desc: "Không thể lưu ca làm việc lúc này.",
          isSuccess: false
        });
      }
    }
  };

  const handleDeleteShift = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa ca làm việc này? Dữ liệu không thể khôi phục.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await shiftService.delete(id);
          fetchData();
          notice({
            msg: "Đã xóa ca làm việc",
            desc: "Ca làm việc đã được xóa khỏi hệ thống.",
            isSuccess: true
          });
        } catch (error) {
          const backendMsg = error.response?.data?.message || error.response?.data?.Message;
          
          notice({
            msg: "Không thể xóa",
            desc: backendMsg || "Có lỗi xảy ra, không thể xóa ca làm việc này.", // Ưu tiên hiện message của Backend
            isSuccess: false
          });
        }
      }
    });
  };

  /**
   * ==========================================
   * 4. HOLIDAY MANAGEMENT HANDLERS (NGÀY LỄ)
   * ==========================================
   */
  const formatDateInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Format sang yyyy-MM-dd cho input type="date"
  };

  const handleOpenAddHoliday = () => {
    setIsEditingHoliday(false);
    setHolidayForm({ id: 0, holidayName: '', startDate: '', endDate: '', isRecurring: false });
    setIsHolidayModalOpen(true);
  };

  const handleOpenEditHoliday = (holiday) => {
    setIsEditingHoliday(true);
    setHolidayForm({
      id: holiday.id,
      holidayName: holiday.holidayName,
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
      // UX Tweak: Nếu đang tạo mới, khi chọn Ngày bắt đầu thì tự động điền luôn Ngày kết thúc
      if (name === 'startDate' && !isEditingHoliday && !prev.endDate) {
        newData.endDate = value;
      }
      return newData;
    });
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();

    // Business Validation: Ngày kết thúc không được nhỏ hơn ngày bắt đầu
    if (new Date(holidayForm.endDate) < new Date(holidayForm.startDate)) {
      return notice({
        msg: "Dữ liệu không hợp lệ",
        desc: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!",
        isSuccess: false
      });
    }

    try {
      if (isEditingHoliday) {
        await publicHolidayService.update(holidayForm.id, holidayForm);
      } else {
        const { id, ...dataToSend } = holidayForm;
        await publicHolidayService.create(dataToSend);
      }

      setIsHolidayModalOpen(false);
      fetchData();
      notice({
        msg: isEditingHoliday ? "Cập nhật ngày lễ thành công" : "Tạo ngày lễ thành công",
        desc: `Kỳ nghỉ "${holidayForm.holidayName}" đã được thiết lập.`,
        isSuccess: true
      });
    } catch (error) {
      const responseData = error.response?.data;
      const backendMsg = responseData?.message || responseData?.Message;

      if (backendMsg) {
        // Trải nghiệm giống hệt bên Shift: Bắn thẳng câu chửi của Backend lên tiêu đề
        notice({
          msg: backendMsg, 
          isSuccess: false
        });
      } else {
        // Fallback nếu lỗi sập server (500) hoặc mất mạng
        notice({
          msg: "Lỗi lưu ngày lễ",
          desc: "Có lỗi xảy ra, vui lòng thử lại.",
          isSuccess: false
        });
      }
    }
  };

  const handleDeleteHoliday = (id) => {
    Modal.confirm({
      title: 'Xóa ngày lễ',
      content: 'Bạn có chắc chắn muốn xóa ngày lễ này khỏi lịch công ty?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await publicHolidayService.delete(id);
          fetchData();
          notice({
            msg: "Xóa thành công",
            desc: "Ngày lễ đã được xóa khỏi cấu hình.",
            isSuccess: true
          });
        } catch (error) { 
          const responseData = error.response?.data;
          const backendMsg = responseData?.message || responseData?.Message;

          notice({
            msg: "Không thể xóa", 
            desc: backendMsg || "Lỗi hệ thống, không thể xóa ngày lễ lúc này.", 
            isSuccess: false
          });
        }
      }
    });
  };

  /**
   * ==========================================
   * 5. RENDER HELPERS
   * ==========================================
   */
  const formatDateRange = (start, end) => {
    if (!start) return '';
    const s = new Date(start).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const e = new Date(end).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return s === e ? s : `${s} - ${e}`;
  };

  const formatTime = (time) => time?.substring(0, 5) || '--:--';

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thiết Lập Chấm Công</h1>
          <p className="mt-1 text-sm text-slate-500">Cấu hình lịch làm việc và các ngày nghỉ lễ của tổ chức.</p>
        </div>
      </div>

      {/* --- PHẦN 1: CA LÀM VIỆC --- */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">timer</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ca Làm Việc</h2>
          </div>
          <button onClick={handleOpenAddShift} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span> Thêm Ca Mới
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <div key={shift.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Ca làm việc</p>
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
                  <span>Giờ làm: <span className="font-semibold">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span></span>
                </div>
                {shift.breakStartTime && (
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-lg text-slate-400">restaurant</span>
                    <span>Nghỉ ngơi: {formatTime(shift.breakStartTime)} - {formatTime(shift.breakEndTime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-lg text-slate-400">warning</span>
                  <span>Đi muộn: {shift.allowedLateMinutes}p | Về sớm: {shift.allowedEarlyLeaveMinutes}p</span>
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleOpenAddShift} className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-slate-400 transition-colors hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 dark:border-gray-700 dark:bg-slate-800/50">
            <span className="material-symbols-outlined text-2xl">add</span>
            <span className="mt-3 font-medium">Tạo Ca Làm Việc Mới</span>
          </button>
        </div>
      </div>

      {/* --- PHẦN 2: NGÀY LỄ --- */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">calendar_month</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ngày Lễ</h2>
          </div>
          <button onClick={handleOpenAddHoliday} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-white">
            <span className="material-symbols-outlined text-lg">add</span> Thêm Ngày Lễ
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-gray-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên Ngày Lễ</th>
                <th className="px-6 py-4 font-semibold">Thời Gian</th>
                <th className="px-6 py-4 font-semibold text-center">Lặp Lại Hàng Năm</th>
                <th className="px-6 py-4 text-right font-semibold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {holidays.length > 0 ? (
                holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{holiday.holidayName}</td>
                    <td className="px-6 py-4">{formatDateRange(holiday.startDate, holiday.endDate)}</td>
                    <td className="px-6 py-4 text-center">
                      {holiday.isRecurring ? <span className="text-green-600">Có</span> : <span className="text-gray-400">Không</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEditHoliday(holiday)} className="text-slate-400 hover:text-blue-600">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-slate-400 hover:text-red-600">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Không tìm thấy ngày lễ nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: SHIFT ================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{isEditingShift ? 'Cập Nhật Ca Làm Việc' : 'Thêm Ca Làm Việc'}</h3>
            <form onSubmit={handleSaveShift} className="space-y-4">
              {/* SỬA LẠI KHỐI TÊN CA LÀM VIỆC NHƯ SAU */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Tên ca làm việc <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full border rounded p-2 outline-none transition-colors 
                      ${shiftErrors.shiftName ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-blue-500 dark:bg-slate-700 dark:border-gray-600'}
                    `}
                  value={shiftForm.shiftName}
                  onChange={e => {
                    setShiftForm({ ...shiftForm, shiftName: e.target.value });
                    // Trải nghiệm người dùng: Xóa dòng lỗi màu đỏ ngay khi user bắt đầu gõ
                    if (e.target.value.trim()) {
                      setShiftErrors({ ...shiftErrors, shiftName: null });
                    }
                  }}
                />
                {/* HIỂN THỊ DÒNG LỖI MÀU ĐỎ DƯỚI INPUT */}
                {shiftErrors.shiftName && (
                  <p className="mt-1 text-xs font-semibold text-red-500 animate-[fadeIn_0.2s_ease-out]">
                    {shiftErrors.shiftName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Giờ bắt đầu</label>
                  <input type="time" required className="w-full border rounded p-2 dark:bg-slate-700 dark:border-gray-600" value={shiftForm.startTime} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Giờ kết thúc</label>
                  <input type="time" required className="w-full border rounded p-2 dark:bg-slate-700 dark:border-gray-600" value={shiftForm.endTime} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg dark:bg-slate-700/30">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Bắt đầu nghỉ (Tùy chọn)</label>
                  <input
                    type="time"
                    className={`w-full border rounded p-2 outline-none transition-colors 
                        ${shiftErrors.breakStartTime ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500' : 'dark:bg-slate-700 dark:border-gray-600'}
                      `}
                    value={shiftForm.breakStartTime}
                    onChange={e => {
                      setShiftForm({ ...shiftForm, breakStartTime: e.target.value });
                      if (shiftErrors.breakStartTime) setShiftErrors({ ...shiftErrors, breakStartTime: null }); // Tắt lỗi khi user gõ lại
                    }}
                  />
                  {/* 🌟 Hiện lỗi trả về từ Backend */}
                  {shiftErrors.breakStartTime && <p className="mt-1 text-[10px] font-semibold text-red-500">{shiftErrors.breakStartTime}</p>}
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-500">Kết thúc nghỉ</label>
                  <input
                    type="time"
                    className={`w-full border rounded p-2 outline-none transition-colors 
                        ${shiftErrors.breakEndTime ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500' : 'dark:bg-slate-700 dark:border-gray-600'}
                      `}
                    value={shiftForm.breakEndTime}
                    onChange={e => {
                      setShiftForm({ ...shiftForm, breakEndTime: e.target.value });
                      if (shiftErrors.breakEndTime) setShiftErrors({ ...shiftErrors, breakEndTime: null });
                    }}
                  />
                  {/* 🌟 Hiện lỗi trả về từ Backend */}
                  {shiftErrors.breakEndTime && <p className="mt-1 text-[10px] font-semibold text-red-500">{shiftErrors.breakEndTime}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm mb-2 font-medium">Ngày làm việc trong tuần</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = shiftForm.workDays?.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200'
                          }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Đi muộn cho phép (Phút)</label>
                  <input type="number" min="0" className="w-full border rounded p-2 dark:bg-slate-700 dark:border-gray-600" value={shiftForm.allowedLateMinutes} onChange={e => setShiftForm({ ...shiftForm, allowedLateMinutes: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Về sớm cho phép (Phút)</label>
                  <input type="number" min="0" className="w-full border rounded p-2 dark:bg-slate-700 dark:border-gray-600" value={shiftForm.allowedEarlyLeaveMinutes} onChange={e => setShiftForm({ ...shiftForm, allowedEarlyLeaveMinutes: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded text-slate-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-white">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu thay đổi</button>
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
              {isEditingHoliday ? 'Cập Nhật Ngày Lễ' : 'Thêm Ngày Lễ'}
            </h3>

            <form onSubmit={handleSaveHoliday} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tên ngày lễ</label>
                <input required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                  placeholder="VD: Tết Nguyên Đán"
                  value={holidayForm.holidayName}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holidayName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label>
                  <input type="date" required name="startDate"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                    value={holidayForm.startDate}
                    onChange={handleHolidayDateChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label>
                  <input type="date" required name="endDate"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-slate-700/50">
                <input type="checkbox" id="isRecurring" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={holidayForm.isRecurring}
                  onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Lặp lại hàng năm?</label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700">Hủy</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {isEditingHoliday ? 'Lưu Thay Đổi' : 'Tạo Ngày Lễ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}