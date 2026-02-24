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
      const dayLogs = logs.filter(l => {
        const lDate = new Date(l.workDate);
        return lDate.getDate() === i;
      });

      days.push({ 
        type: 'day', 
        key: `day-${i}`, 
        day: i, 
        date: currentDate,
        logs: dayLogs
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
                 const dayLogs = item.logs;

                 const totalHours = dayLogs.reduce((sum, l) => sum + (l.workingHours || 0), 0).toFixed(1);

                 return (
                   <div 
                      key={item.key} 
                      onClick={() => setSelectedDateLog({ day: item.day, date: item.date, logs: dayLogs })} // Truyền logs
                      className={`min-h-[110px] p-2 bg-white hover:bg-blue-50 cursor-pointer transition-colors relative
                        ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/50' : ''}
                      `}
                   >
                      <span className="text-sm font-bold text-gray-700">{item.day}</span>
                      
                      {/* HIỂN THỊ MẢNG CA LÀM VIỆC */}
                      {dayLogs.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">
                            {dayLogs.length} ca làm việc
                          </span>
                          
                          {/* Dùng .map để vẽ số chấm màu tương ứng với số ca */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dayLogs.map((l, idx) => (
                               <div key={idx} className={`w-2 h-2 rounded-full ${getDotColor(l)}`} title={l.shiftName}></div>
                            ))}
                          </div>
                          
                          <span className="text-[10px] font-semibold text-slate-400">{totalHours}h</span>
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden max-h-[800px]">
            
            {selectedDateLog ? (
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold">
                    Details for {selectedDateLog.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDateLog.logs && selectedDateLog.logs.length > 0 
                      ? `Phát hiện ${selectedDateLog.logs.length} ca làm việc` 
                      : 'Không có lịch trình'}
                  </p>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                   {selectedDateLog.logs && selectedDateLog.logs.length > 0 ? (
                      
                      <div className="space-y-10">
                         {/* LẶP QUA MẢNG LOGS ĐỂ RENDER TỪNG CA */}
                         {selectedDateLog.logs.map((logItem, index) => (
                            <div key={index} className="relative">
                               
                               {/* NẾU LÀ CA NGHỈ LỄ */}
                               {logItem.status === 'Holiday' ? (
                                  <div className="flex flex-col items-center justify-center text-center py-6 bg-purple-50 rounded-xl border border-purple-100">
                                     <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">celebration</span>
                                     <h4 className="font-bold text-purple-900 text-base">Nghỉ Lễ: {logItem.shiftName}</h4>
                                     <p className="text-xs text-purple-700 mt-1">{logItem.note}</p>
                                     <p className="text-xs text-purple-500 mt-2 font-semibold flex items-center gap-1 justify-center">
                                       <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                       Cộng {logItem.workingHours}h công
                                     </p>
                                  </div>
                               ) : (

                                  /* NẾU LÀ CA LÀM VIỆC BÌNH THƯỜNG */
                                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gray-100">
                                     
                                     {/* Tên Ca làm việc & Trạng thái của ca đó */}
                                     <div className="relative flex items-center justify-between gap-3 z-10 bg-white pr-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 flex justify-center"><div className={`w-3 h-3 rounded-full ring-4 ring-white ${getDotColor(logItem)}`}></div></div>
                                          <h4 className="font-bold text-gray-800 text-sm tracking-wider">{logItem.shiftName}</h4>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${getStatusColor(logItem)}`}>
                                          {logItem.status}
                                        </span>
                                     </div>

                                     {/* Check In */}
                                     <div className="relative flex items-center justify-between gap-6 pl-10">
                                        <div>
                                           <p className="text-sm font-bold">Check-in</p>
                                           <p className="text-xs text-gray-500">{logItem.status === 'Absent' ? 'Không có dữ liệu' : 'Ghi nhận'}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${logItem.status === 'Late' ? 'text-orange-600' : ''}`}>
                                           {logItem.checkInTime ? new Date(logItem.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                        </span>
                                     </div>

                                     {/* Check Out */}
                                     <div className="relative flex items-center justify-between gap-6 pl-10">
                                        <div>
                                           <p className={`text-sm font-bold ${logItem.status === 'MissingCheckOut' ? 'text-rose-600' : ''}`}>Check-out</p>
                                           <p className="text-xs text-gray-500">{logItem.status === 'MissingCheckOut' ? 'Quên chấm ra' : 'Ghi nhận'}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${logItem.status === 'MissingCheckOut' ? 'text-rose-600' : ''}`}>
                                           {logItem.checkOutTime ? new Date(logItem.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                        </span>
                                     </div>

                                     {/* Ghi chú & Số giờ */}
                                     <div className="pl-10 mt-2">
                                         <div className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                                             Total: {logItem.workingHours || 0} hrs
                                         </div>
                                         {logItem.note && <p className="text-xs text-gray-500 mt-2 italic">* {logItem.note}</p>}
                                     </div>
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>

                   ) : (
                     <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-2">weekend</span>
                        <p>Ngày nghỉ. Không có dữ liệu chấm công.</p>
                     </div>
                   )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
                 <span className="material-symbols-outlined text-5xl mb-3 opacity-20">touch_app</span>
                 <p className="text-sm font-medium">Click vào một ngày để xem chi tiết</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}