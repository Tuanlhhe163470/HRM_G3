'use client';
import React, { useState, useEffect } from 'react';
import attendanceService from '@/services/TimeAndAttendance/attendanceService';

export default function TimesheetPage() {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date()); // Dùng để xác định tháng/năm đang xem
  const [logs, setLogs] = useState([]); // Dữ liệu từ API
  const [selectedDateLog, setSelectedDateLog] = useState(null); // Log của ngày đang click chọn

  // --- 1. FETCH DỮ LIỆU ---
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = viewDate.getMonth() + 1;
      const year = viewDate.getFullYear();
      
      const res = await attendanceService.getMyHistory(month, year);
      setLogs(res.data || []);
      
      // Mặc định chọn ngày hôm nay nếu đang ở tháng hiện tại, không thì chọn ngày 1
      setSelectedDateLog(null); 
    } catch (error) {
      console.error("Lỗi tải timesheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [viewDate]);

  // --- 2. LOGIC LỊCH (CORE) ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Ngày đầu tháng bắt đầu vào thứ mấy? (0 = CN, 1 = T2... 6 = T7)
    // Lưu ý: Lịch của bạn T2 là cột đầu, nên cần chỉnh lại index một chút
    let firstDayIndex = new Date(year, month, 1).getDay(); 
    // Convert: CN(0) -> 6, T2(1) -> 0, ...
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];

    // Tạo các ô trống đầu tháng
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    // Tạo các ô ngày thực tế
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      // Tìm xem ngày này có log chấm công không
      const log = logs.find(l => {
        const lDate = new Date(l.workDate);
        return lDate.getDate() === i;
      });

      days.push({ 
        type: 'day', 
        key: `day-${i}`, 
        day: i, 
        date: currentDate,
        log: log // Gắn kèm log vào ngày
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(viewDate);

  // --- 3. HELPER CHUYỂN THÁNG ---
  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
    setViewDate(new Date(newDate));
  };

  // --- 4. HELPER MÀU SẮC (CẬP NHẬT MỚI) ---
  const getStatusColor = (log) => {
    if (!log) return 'text-gray-400 bg-gray-50 border-gray-100'; // Không có dữ liệu / Cuối tuần
    
    switch (log.status) {
      case 'OnTime': return 'text-green-600 bg-green-50 border-green-200';
      case 'Late': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'EarlyLeave': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Absent': return 'text-red-600 bg-red-50 border-red-200';
      
      // THÊM 2 TRẠNG THÁI MỚI
      case 'Holiday': return 'text-purple-600 bg-purple-50 border-purple-200'; 
      case 'MissingCheckOut': return 'text-rose-600 bg-rose-50 border-rose-200'; 
      
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDotColor = (log) => {
    if (!log) return 'bg-transparent';
    switch (log.status) {
        case 'OnTime': return 'bg-green-500';
        case 'Late': return 'bg-orange-500';
        case 'EarlyLeave': return 'bg-yellow-500';
        case 'Absent': return 'bg-red-500';
        
        // THÊM 2 TRẠNG THÁI MỚI
        case 'Holiday': return 'bg-purple-500';
        case 'MissingCheckOut': return 'bg-rose-500';
        
        default: return 'bg-blue-500';
    }
  };

  // --- 5. TÍNH TOÁN THỐNG KÊ ---
  const stats = {
    standardDays: 22, // Cái này thường lấy từ cấu hình chung
    actualWork: logs.reduce((acc, curr) => acc + (curr.workingHours || 0), 0).toFixed(1),
    lateCount: logs.filter(l => l.status === 'Late').length,
    paidLeave: 0 // Cần API Leave mới tính được
  };

  // --- RENDER ---
  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-10 flex flex-col gap-8 text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight">My Personal Timesheet</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-lg font-semibold px-2 min-w-[150px] text-center">
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          {/* Legend đơn giản */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium bg-white p-3 rounded-xl border shadow-sm">
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> On Time</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Late</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Absent</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Miss Out</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Holiday</div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actual Work (Hrs)</p>
            <p className="text-3xl font-black mt-1 text-blue-600">{stats.actualWork}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Late Arrivals</p>
            <p className="text-3xl font-black mt-1 text-orange-500">{stats.lateCount}</p>
          </div>
          {/* Các ô khác tương tự */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* === LEFT: CALENDAR GRID === */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header Thứ */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
              ))}
            </div>

            {/* Body Ngày */}
            <div className="grid grid-cols-7 bg-gray-100 gap-[1px] border-b border-gray-200">
               {calendarDays.map((item) => {
                 if (item.type === 'empty') {
                    return <div key={item.key} className="min-h-[110px] bg-white"></div>;
                 }

                 const isSelected = selectedDateLog?.day === item.day;
                 const log = item.log;

                 return (
                   <div 
                      key={item.key} 
                      onClick={() => setSelectedDateLog({ day: item.day, date: item.date, log: log })}
                      className={`min-h-[110px] p-2 bg-white hover:bg-blue-50 cursor-pointer transition-colors relative
                        ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/50' : ''}
                      `}
                   >
                      <span className={`text-sm font-bold ${log?.status === 'Late' ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.day}
                      </span>
                      
                      {log && (
                        <div className="mt-2 flex flex-col gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">
                            {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} - 
                            {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </span>
                          <div className="flex gap-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getDotColor(log)}`}></div>
                          </div>
                          {/* Hiển thị working hours */}
                          <span className="text-[10px] font-semibold text-slate-400">{log.workingHours}h</span>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* === RIGHT: DETAILS PANEL === */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            
            {selectedDateLog ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold">
                    Details for {selectedDateLog.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className={`text-sm mt-1 font-medium inline-block px-2 py-1 rounded ${getStatusColor(selectedDateLog.log)}`}>
                    {selectedDateLog.log ? selectedDateLog.log.status : 'No Data'}
                  </p>
                </div>
                
                <div className="p-6 flex-1">
                   {selectedDateLog.log ? (
                      
                      // NẾU LÀ NGÀY NGHỈ LỄ
                      selectedDateLog.log.status === 'Holiday' ? (
                        <div className="flex flex-col items-center justify-center text-center py-8 bg-purple-50 rounded-xl border border-purple-100">
                           <span className="material-symbols-outlined text-5xl text-purple-500 mb-3">celebration</span>
                           <h4 className="font-bold text-purple-900 text-lg">Hôm nay là ngày nghỉ Lễ!</h4>
                           <p className="text-sm text-purple-700 mt-2">{selectedDateLog.log.note}</p>
                           <p className="text-xs text-purple-500 mt-4 font-semibold">Vẫn được tính {selectedDateLog.log.workingHours}h công hưởng lương</p>
                        </div>
                      ) : (

                      // NẾU LÀ NGÀY ĐI LÀM BÌNH THƯỜNG / ĐI MUỘN / QUÊN CHẤM CÔNG
                      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gray-100">
                        
                        {/* Check In */}
                        <div className="relative flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4 z-10">
                             <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm">
                                <span className="material-symbols-outlined text-blue-600">login</span>
                             </div>
                             <div>
                                <p className="text-sm font-bold">Check-in</p>
                                <p className="text-xs text-gray-500">
                                   {selectedDateLog.log.status === 'Absent' ? 'Không có dữ liệu' : 'Hệ thống ghi nhận'}
                                </p>
                             </div>
                          </div>
                          <span className={`text-sm font-bold ${selectedDateLog.log.status === 'Late' ? 'text-orange-600' : ''}`}>
                             {selectedDateLog.log.checkInTime ? new Date(selectedDateLog.log.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </span>
                        </div>

                        {/* Check Out */}
                        <div className="relative flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4 z-10">
                             {/* Đổi màu icon nếu quên Check-out */}
                             <div className={`flex items-center justify-center w-10 h-10 rounded-full border shadow-sm
                                ${selectedDateLog.log.status === 'MissingCheckOut' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 bg-white'}
                             `}>
                                <span className={`material-symbols-outlined ${selectedDateLog.log.status === 'MissingCheckOut' ? 'text-rose-600' : 'text-purple-600'}`}>
                                   {selectedDateLog.log.status === 'MissingCheckOut' ? 'error' : 'logout'}
                                </span>
                             </div>
                             <div>
                                <p className={`text-sm font-bold ${selectedDateLog.log.status === 'MissingCheckOut' ? 'text-rose-600' : ''}`}>Check-out</p>
                                <p className="text-xs text-gray-500">
                                   {selectedDateLog.log.status === 'MissingCheckOut' ? 'Quên chấm công ra' : 'Hệ thống ghi nhận'}
                                </p>
                             </div>
                          </div>
                          <span className={`text-sm font-bold ${selectedDateLog.log.status === 'MissingCheckOut' ? 'text-rose-600' : ''}`}>
                             {selectedDateLog.log.checkOutTime ? new Date(selectedDateLog.log.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </span>
                        </div>

                         {/* Ca làm việc & Ghi chú */}
                         <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-gray-500 uppercase font-bold">Thông tin ca</p>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{selectedDateLog.log.workingHours || 0} hrs</span>
                             </div>
                             <p className="text-sm font-medium">{selectedDateLog.log.shiftName || 'Standard Shift'}</p>
                             
                             {/* Hiện thông báo lỗi từ BE nếu có */}
                             {selectedDateLog.log.note && (
                               <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 italic">
                                 * {selectedDateLog.log.note}
                               </p>
                             )}
                         </div>
                      </div>
                      )
                   ) : (
                     // NẾU KHÔNG CÓ DỮ LIỆU (CUỐI TUẦN)
                     <div className="text-center text-gray-400 py-10">
                        <span className="material-symbols-outlined text-4xl mb-2">weekend</span>
                        <p>Ngày nghỉ. Không có dữ liệu chấm công.</p>
                     </div>
                   )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
                 <span className="material-symbols-outlined text-5xl mb-3 opacity-20">calendar_today</span>
                 <p className="text-sm">Select a date to view details</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}