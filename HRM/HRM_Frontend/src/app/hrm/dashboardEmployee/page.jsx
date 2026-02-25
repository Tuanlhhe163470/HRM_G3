'use client';

import React, { useState, useEffect } from 'react';
import attendanceService from '@/services/TimeAndAttendance/attendanceService';

export default function EmployeeDashboard() {
  // --- STATE QUẢN LÝ ---
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState('LOADING'); // 'NOT_CHECKED_IN', 'CHECKED_IN', 'COMPLETED'
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMounted, setIsMounted] = useState(false);
  
  // Thông tin user hiển thị (Demo)
  const user = { name: "Nguyen Van A" };

  // --- 1. ĐỒNG HỒ REAL-TIME ---
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. KIỂM TRA TRẠNG THÁI HÔM NAY ---
  const checkTodayStatus = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const res = await attendanceService.getMyHistory(today.getMonth() + 1, today.getFullYear());
      
      const logs = res.data || []; 
      
      // 1. TÌM TẤT CẢ CÁC LOG CỦA NGÀY HÔM NAY (Dùng filter thay vì find)
      const todayLogs = logs.filter(log => {
        const logDate = new Date(log.workDate);
        return logDate.getDate() === today.getDate() &&
               logDate.getMonth() === today.getMonth() &&
               logDate.getFullYear() === today.getFullYear();
      });

      // 2. TÌM XEM CÓ CA NÀO ĐANG "TREO" (Chưa check-out) KHÔNG?
      const activeLog = todayLogs.find(log => log.checkInTime && !log.checkOutTime);

      if (activeLog) {
        // Đang có 1 ca chưa Check-out -> Trạng thái là CHECKED_IN (để hiện nút Check-out màu cam)
        setAttendanceStatus('CHECKED_IN');
      } else {
        // KHÔNG có ca nào đang treo.
        // Có thể là chưa làm ca nào, hoặc đã làm xong ca 1 và chuẩn bị làm ca 2.
        // Cứ mở nút Check-in (màu xanh). Backend sẽ tự lo việc kiểm tra xem giờ này có ca nào hợp lệ không!
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

  // --- 3. XỬ LÝ CLICK NÚT ---
  const handleAttendanceClick = async () => {
    setLoading(true);
    try {
      // Lấy tọa độ GPS (Optional)
      let locationData = {};
      // if ("geolocation" in navigator) {
      //    try {
      //       const position = await new Promise((resolve, reject) => {
      //           navigator.geolocation.getCurrentPosition(
      //               (pos) => resolve(pos), 
      //               (err) => reject(err), 
      //               { timeout: 3000, maximumAge: 300000 } // Chấp nhận vị trí cũ trong vòng 5 phút
      //           );
      //       });
      //       locationData = {
      //           latitude: position.coords.latitude,
      //           longitude: position.coords.longitude
      //       };
      //    } catch (e) {
      //       console.warn("Không lấy được GPS:", e);
      //    }
      // }

      if (attendanceStatus === 'NOT_CHECKED_IN') {
        // ==> GỌI CHECK-IN
        await attendanceService.checkIn({ 
            note: "Check-in từ Web Dashboard",
            ...locationData
        });
        alert("✅ Check-in thành công! Chúc bạn một ngày làm việc hiệu quả.");
        setAttendanceStatus('CHECKED_IN'); // Cập nhật state ngay lập tức
      } 
      else if (attendanceStatus === 'CHECKED_IN') {
        // ==> GỌI CHECK-OUT
        if (window.confirm("Bạn có chắc chắn muốn kết thúc ca làm việc?")) {
            await attendanceService.checkOut({ 
                note: "Check-out từ Web Dashboard",
                ...locationData
            });
            alert("👋 Check-out thành công! Hẹn gặp lại.");
            setAttendanceStatus('COMPLETED');
        }
      }

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`❌ Có lỗi xảy ra: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FORMAT ---
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // --- RENDER NÚT BẤM THEO TRẠNG THÁI ---
  const renderAttendanceButton = () => {
    if (loading && attendanceStatus === 'LOADING') {
        return (
            <button disabled className="flex items-center gap-2 rounded-xl bg-gray-300 px-8 py-4 text-white">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Loading...
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
                    ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600' // Style Check-in (Xanh)
                    : 'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600'   // Style Check-out (Cam)
                }
            `}
        >
            <span className={`material-symbols-outlined text-2xl ${!loading && 'group-hover:animate-pulse'}`}>
                {loading ? 'hourglass_top' : (isCheckIn ? 'fingerprint' : 'logout')}
            </span>
            <span className="text-lg font-bold tracking-wide">
                {loading ? 'PROCESSING...' : (isCheckIn ? 'CHECK-IN' : 'CHECK-OUT')}
            </span>
        </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      
      {/* --- SECTION 1: HERO CHECK-IN --- */}
      <div className="relative overflow-hidden rounded-xl bg-white p-0 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-blue-600">
              <span className="material-symbols-outlined fill">wb_sunny</span>
              <span className="text-sm font-medium tracking-wide uppercase">{isMounted ? formattedDate : 'Loading Date ...'}</span>
            </div>
            {/* Đồng hồ chạy thật */}
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl min-w-[200px]">
              {isMounted ? formattedTime : '--:--:--'}
            </h2>
            <p className="text-lg text-slate-500 dark:text-gray-400">
                Good morning, {user.name}! 
                {attendanceStatus === 'NOT_CHECKED_IN' && " Ready to start?"}
                {attendanceStatus === 'CHECKED_IN' && " Have a great working day!"}
                {attendanceStatus === 'COMPLETED' && " See you tomorrow!"}
            </p>
          </div>
          
          <div className="mt-6 flex items-center gap-4 md:mt-0">
             {/* RENDER NÚT Ở ĐÂY */}
             {renderAttendanceButton()}
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-emerald-500/50"></div>
      </div>

      {/* --- SECTION 2: STATS GRID --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Card 1: Workdays */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Workdays</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Current Month</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">18<span className="text-xl font-medium text-slate-500">/22</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">On Track</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: '81%' }}></div>
          </div>
        </div>

        {/* Card 2: Late Duration */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20">
                <span className="material-symbols-outlined">timer_off</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Late Duration</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Total</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">0 <span className="text-lg font-normal text-slate-500">mins</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Perfect</span>
          </div>
          <p className="mt-4 text-sm text-slate-500">Great job! You are consistently on time.</p>
        </div>

        {/* Card 3: Leave Balance */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                <span className="material-symbols-outlined">beach_access</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Annual Leave</h3>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Request Leave</button>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">4.5 <span className="text-lg font-normal text-slate-500">Days</span></span>
            <span className="text-sm text-slate-500">Remaining</span>
          </div>
           {/* Visual bar */}
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

      {/* --- SECTION 3: NOTIFICATIONS & HOLIDAYS --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Notifications */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Latest Notifications</h3>
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Leave Request Approved</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs text-slate-500">2 hours ago</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">Your leave request for <span className="font-medium text-slate-900 dark:text-gray-200">Oct 20, 2023</span> was approved.</p>
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined text-[20px]">campaign</span>
              </div>
               <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">New Policy Update</span>
                  <span className="text-xs text-slate-500">Yesterday</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">The updated WFH policy document is now available.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Holidays */}
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
           <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Holidays</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Holiday 1 */}
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-blue-600">flag</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sep 02</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">National Day</p>
            </div>
            {/* Holiday 2 */}
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-indigo-500">celebration</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jan 01</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">New Year</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}