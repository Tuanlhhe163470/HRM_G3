'use client';

import React, { useState, useEffect } from 'react';
import attendanceService from '@/services/TimeAndAttendance/attendanceService';
import useNotice from '@/components/Notice'; 

export default function EmployeeDashboard() {
  /**
   * HOOKS & STATES
   */
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState('LOADING'); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState({ name: "Đang tải..." });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  
  // 1. Khởi tạo custom hook notification
  const notice = useNotice();

  /**
   * INITIALIZATION: Đồng hồ và Giải mã thông tin người dùng từ Token
   */
  useEffect(() => {
    setIsMounted(true);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        setUser({ name: payload.unique_name || "Nhân viên" });
      }
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      setUser({ name: "Nhân viên" });
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  //tải GPS sẵn
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLocating(false); // Dò xong
        },
        (error) => {
          console.warn("Không lấy được GPS:", error.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  /**
   * BUSINESS LOGIC: Kiểm tra lịch sử chấm công trong ngày để xác định trạng thái nút bấm
   */
  const checkTodayStatus = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const res = await attendanceService.getMyHistory(today.getMonth() + 1, today.getFullYear());
      
      const logs = res.data || []; 
      
      const safeLogs = Array.isArray(logs) ? logs : (logs?.logs || []);

      const todayLogs = safeLogs.filter(log => {
        const logDate = new Date(log.workDate);
        return logDate.getDate() === today.getDate() &&
               logDate.getMonth() === today.getMonth() &&
               logDate.getFullYear() === today.getFullYear(); 
      });

      // Xác định nếu có ca làm việc nào chưa kết thúc (Check-out)
      const activeLog = todayLogs.find(log => log.checkInTime && !log.checkOutTime);

      if (activeLog) {
        setAttendanceStatus('CHECKED_IN');
      } else {
        setAttendanceStatus('NOT_CHECKED_IN');
      }

    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTodayStatus();
  }, []);

  /**
   * HANDLERS: Xử lý sự kiện Check-in / Check-out
   */
  const handleAttendanceClick = async () => {
    if (isLocating) {
      notice({ msg: "Đang định vị", desc: "Vui lòng chờ 1-2 giây để hệ thống xác định vị trí của bạn.", isSuccess: false });
      return;
    }
    setLoading(true);
    try {
      let locationData = {};
      if (currentLocation) {
          locationData = {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
          };
      }

      if (attendanceStatus === 'NOT_CHECKED_IN') {
        await attendanceService.checkIn({ 
            note: "Check-in từ Web Dashboard",
            ...locationData
        });
        
        // 2. Thay thế alert Check-in
        notice({
          msg: "Check-in thành công!",
          desc: "Chúc bạn một ngày làm việc hiệu quả.",
          isSuccess: true
        });
        
        setAttendanceStatus('CHECKED_IN'); 
      } 
      else if (attendanceStatus === 'CHECKED_IN') {
        if (window.confirm("Bạn có chắc chắn muốn kết thúc ca làm việc?")) {
            await attendanceService.checkOut({ 
                note: "Check-out từ Web Dashboard",
                ...locationData
            });
            
            // 3. Thay thế alert Check-out
            notice({
              msg: "Check-out thành công!",
              desc: "Hẹn gặp lại bạn.",
              isSuccess: true
            });
            
            setAttendanceStatus('COMPLETED');
        }
      }

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      
      // 4. Thay thế alert báo lỗi
      notice({
        msg: "Có lỗi xảy ra",
        desc: msg,
        isSuccess: false
      });
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * RENDER HELPERS
   */
  const formattedDate = currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const renderLocationStatus = () => {
    if (isLocating) {
      return (
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 animate-pulse">
          <span className="material-symbols-outlined text-[18px]">location_searching</span>
          Đang dò tìm vị trí...
        </span>
      );
    }
    
    if (currentLocation) {
      return (
        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          Đã xác định vị trí
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
        <span className="material-symbols-outlined text-[18px]">location_off</span>
        Không có vị trí GPS
      </span>
    );
  };

  const renderAttendanceButton = () => {
    if (loading && attendanceStatus === 'LOADING') {
        return (
            <button disabled className="flex items-center gap-2 rounded-xl bg-gray-300 px-8 py-4 text-white">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Đang tải...
            </button>
        );
    }
    const isCheckIn = attendanceStatus === 'NOT_CHECKED_IN';
    
    return (
        <button 
            onClick={handleAttendanceClick}
            disabled={loading}
            className={`group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-white shadow-lg transition-all active:scale-95
                ${loading ? 'opacity-70 cursor-wait' : ''}
                ${isCheckIn 
                    ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600'
                    : 'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600'
                }
            `}
        >
            <span className={`material-symbols-outlined text-2xl ${!loading && 'group-hover:animate-pulse'}`}>
                {loading ? 'hourglass_top' : (isCheckIn ? 'fingerprint' : 'logout')}
            </span>
            <span className="text-lg font-bold tracking-wide">
                {loading ? 'ĐANG XỬ LÝ...' : (isCheckIn ? 'VÀO CA (CHECK-IN)' : 'TAN CA (CHECK-OUT)')}
            </span>
        </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      
      {/* --- PHẦN 1: BANNER CHẤM CÔNG --- */}
      <div className="relative overflow-hidden rounded-xl bg-white p-0 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-blue-600">
              <span className="material-symbols-outlined fill">wb_sunny</span>
              <span className="text-sm font-medium tracking-wide uppercase">{isMounted ? formattedDate : 'Đang tải ngày...'}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl min-w-[200px]">
              {isMounted ? formattedTime : '--:--:--'}
            </h2>
            <p className="text-lg text-slate-500 dark:text-gray-400">
                Chào buổi sáng, {user.name}! 
                {attendanceStatus === 'NOT_CHECKED_IN' && " Bạn đã sẵn sàng làm việc chưa?"}
                {attendanceStatus === 'CHECKED_IN' && " Chúc bạn một ngày làm việc hiệu quả!"}
                {attendanceStatus === 'COMPLETED' && " Hẹn gặp lại bạn vào ngày mai!"}
            </p>
          </div>
          
          <div className="mt-6 flex flex-col items-start gap-3 md:mt-0 md:items-end">
             {renderLocationStatus()}
             {renderAttendanceButton()}
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-emerald-500/50"></div>
      </div>

      {/* --- PHẦN 2: THỐNG KÊ TỔNG QUAN --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Card 1: Ngày làm việc */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Ngày làm việc</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Tháng này</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">18<span className="text-xl font-medium text-slate-500">/22</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Đúng tiến độ</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: '81%' }}></div>
          </div>
        </div>

        {/* Card 2: Thời gian đi muộn */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20">
                <span className="material-symbols-outlined">timer_off</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Đi muộn</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Tổng cộng</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">0 <span className="text-lg font-normal text-slate-500">phút</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Hoàn hảo</span>
          </div>
          <p className="mt-4 text-sm text-slate-500">Tuyệt vời! Bạn luôn đi làm đúng giờ.</p>
        </div>

        {/* Card 3: Số ngày phép */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                <span className="material-symbols-outlined">beach_access</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Phép năm</h3>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Xin nghỉ phép</button>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">4.5 <span className="text-lg font-normal text-slate-500">Ngày</span></span>
            <span className="text-sm text-slate-500">Còn lại</span>
          </div>
           <div className="mt-4 flex gap-1">
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-200 dark:bg-purple-900/30">
               <div className="h-full w-1/2 bg-purple-500 rounded-l-full"></div>
             </div>
           </div>
        </div>
      </div>

      {/* --- PHẦN 3: THÔNG BÁO & NGÀY LỄ --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Thông báo */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Thông báo mới nhất</h3>
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Đơn xin nghỉ phép được duyệt</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs text-slate-500">2 giờ trước</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">Đơn xin nghỉ phép của bạn vào ngày <span className="font-medium text-slate-900 dark:text-gray-200">20 Thg 10, 2023</span> đã được duyệt.</p>
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined text-[20px]">campaign</span>
              </div>
               <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Cập nhật chính sách mới</span>
                  <span className="text-xs text-slate-500">Hôm qua</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">Tài liệu cập nhật chính sách làm việc từ xa (WFH) hiện đã có sẵn.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ngày lễ */}
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
           <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ngày lễ sắp tới</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-blue-600">flag</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">02 Thg 09</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">Quốc khánh</p>
            </div>
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-indigo-500">celebration</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">01 Thg 01</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">Tết Dương lịch</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}