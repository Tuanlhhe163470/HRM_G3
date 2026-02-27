"use client";
import React, { useState, useEffect } from "react";
import attendanceService from "@/services/TimeAndAttendance/attendanceService";
import ExplanationModal from "./ExplanationModal";

export default function TimesheetPage() {
  // --- 1. HOOKS & STATES ---
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  // Tách biệt State để hứng Data chuẩn từ API mới
  const [summary, setSummary] = useState(null); // Hứng cục Thống kê
  const [logs, setLogs] = useState([]); // Hứng mảng Chi tiết ngày
  const [selectedDateLog, setSelectedDateLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [explainingLog, setExplainingLog] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = viewDate.getMonth() + 1;
      const year = viewDate.getFullYear();

      const res = await attendanceService.getMyHistory(month, year);

      if (res.data) {
        setSummary(res.data);

        if (res.data.logs && Array.isArray(res.data.logs)) {
          setLogs(res.data.logs);
        } else if (Array.isArray(res.data)) {
          setLogs(res.data);
        } else {
          setLogs([]);
        }
      } else {
        setSummary(null);
        setLogs([]);
      }

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

  // --- 3. LOGIC LỊCH (CORE) ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];

    const safeLogs = Array.isArray(logs) ? logs : [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dayLogs = safeLogs.filter((l) => {
        const lDate = new Date(l.workDate);
        return lDate.getDate() === i;
      });

      days.push({
        type: "day",
        key: `day-${i}`,
        day: i,
        date: currentDate,
        logs: dayLogs,
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(viewDate);

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
    setViewDate(new Date(newDate));
  };

  // --- 4. UI HELPERS ---
  const getStatusColor = (log) => {
    if (!log) return "text-gray-400 bg-gray-50 border-gray-100";
    switch (log.status) {
      case "OnTime":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Late":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "EarlyLeave":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Absent":
        return "text-red-600 bg-red-50 border-red-200";
      case "Holiday":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "MissingCheckOut":
        return "text-rose-600 bg-rose-50 border-rose-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getDotColor = (log) => {
    if (!log) return "bg-transparent";
    switch (log.status) {
      case "OnTime":
        return "bg-emerald-500";
      case "Late":
        return "bg-orange-500";
      case "EarlyLeave":
        return "bg-amber-500";
      case "Absent":
        return "bg-red-500";
      case "Holiday":
        return "bg-purple-500";
      case "MissingCheckOut":
        return "bg-rose-500";
      default:
        return "bg-blue-500";
    }
  };

  // --- RENDER ---
  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-10 flex flex-col gap-8 text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight">
              Bảng Chấm Công Cá Nhân
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-lg font-semibold px-2 min-w-[150px] text-center capitalize text-blue-700 bg-blue-50 rounded-md py-1">
                {viewDate.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold bg-white p-3 rounded-xl border shadow-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{" "}
              Đúng giờ
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Đi
              muộn
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Về
              sớm
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Vắng
              mặt
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Quên
              Check-out
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>{" "}
              Nghỉ lễ
            </div>
          </div>
        </div>

        {/* ==========================================
            STATS GRID (HIỂN THỊ DỮ LIỆU TỪ BACKEND DTO) 
            ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Giờ làm thực tế
            </p>
            <p className="text-2xl font-black mt-1 text-blue-600">
              {summary?.actualWorkingHours || 0}{" "}
              <span className="text-sm font-semibold text-blue-400">giờ</span>
            </p>
          </div>

          {/* CARD 2: NGHỈ CÓ LƯƠNG (Gộp cả Giờ và Số ngày phép) */}
          <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Nghỉ có lương (Lễ/Phép)
            </p>
            <div className="flex items-end gap-2 mt-1">
              {/* Cột 1: Hiển thị tổng số Giờ */}
              <p className="text-2xl font-black text-purple-600">
                {summary?.paidLeaveHours || 0}{" "}
                <span className="text-sm font-semibold text-purple-400">giờ</span>
              </p>
              
              {/* Cột 2: Hiển thị Số ngày nghỉ phép (đọc từ biến onLeaveCount mới thêm) */}
              <p className="text-sm font-bold text-purple-400 mb-1 border-l-2 border-purple-200 pl-2" title="Số ngày đã dùng phép">
                {summary?.onLeaveCount || 0} ngày phép
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Thống kê Đi Muộn
            </p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-black text-orange-500">
                {summary?.lateCount || 0}{" "}
                <span className="text-sm font-semibold text-orange-400">
                  lần
                </span>
              </p>
              <p className="text-sm font-bold text-orange-400 mb-1 border-l-2 border-orange-200 pl-2">
                {summary?.totalLateMinutes || 0} phút
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Thống kê Về Sớm
            </p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-black text-amber-500">
                {summary?.earlyLeaveCount || 0}{" "}
                <span className="text-sm font-semibold text-amber-400">
                  lần
                </span>
              </p>
              <p className="text-sm font-bold text-amber-400 mb-1 border-l-2 border-amber-200 pl-2">
                {summary?.totalEarlyLeaveMinutes || 0} phút
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Cảnh báo / Vi phạm
            </p>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-sm font-bold text-rose-500 tracking-tight">
                Thiếu Check-out: {summary?.missingCheckOutCount || 0}
              </p>
              <p className="text-sm font-bold text-red-500 tracking-tight">
                Vắng mặt: {summary?.absentCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* === LEFT: CALENDAR GRID === */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-bold text-slate-500 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-slate-100 gap-[1px] border-b border-slate-200">
              {calendarDays.map((item) => {
                if (item.type === "empty") {
                  return (
                    <div
                      key={item.key}
                      className="min-h-[110px] bg-white"
                    ></div>
                  );
                }

                const isSelected = selectedDateLog?.day === item.day;
                const dayLogs = item.logs;
                const totalHours = dayLogs
                  .reduce((sum, l) => sum + (l.workingHours || 0), 0)
                  .toFixed(1);

                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      setSelectedDateLog({
                        day: item.day,
                        date: item.date,
                        logs: dayLogs,
                      })
                    }
                    className={`min-h-[110px] p-2 bg-white hover:bg-blue-50 cursor-pointer transition-colors relative
                        ${isSelected ? "ring-2 ring-inset ring-blue-500 bg-blue-50/50" : ""}
                      `}
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {item.day}
                    </span>

                    {dayLogs.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {dayLogs.length} ca làm việc
                        </span>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayLogs.map((l, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full ${getDotColor(l)}`}
                              title={l.shiftName}
                            ></div>
                          ))}
                        </div>

                        <span className="text-[10px] font-semibold text-slate-400">
                          {totalHours}h
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT: DETAILS PANEL (Giữ nguyên cấu trúc render logs của bạn) === */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden max-h-[800px]">
            {selectedDateLog ? (
              <>
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800">
                    Chi tiết ngày{" "}
                    {selectedDateLog.date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedDateLog.logs && selectedDateLog.logs.length > 0
                      ? `Phát hiện ${selectedDateLog.logs.length} ca làm việc`
                      : "Không có dữ liệu chấm công"}
                  </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  {selectedDateLog.logs && selectedDateLog.logs.length > 0 ? (
                    <div className="space-y-10">
                      {selectedDateLog.logs.map((logItem, index) => (
                        <div key={index} className="relative">
                          {logItem.status === "Holiday" ? (
                            <div className="flex flex-col items-center justify-center text-center py-6 bg-purple-50 rounded-xl border border-purple-100">
                              <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">
                                celebration
                              </span>
                              <h4 className="font-bold text-purple-900 text-base">
                                Nghỉ Lễ: {logItem.shiftName}
                              </h4>
                              <p className="text-xs text-purple-700 mt-1">
                                {logItem.note}
                              </p>
                              <p className="text-xs text-purple-500 mt-2 font-semibold flex items-center gap-1 justify-center">
                                Cộng {logItem.workingHours}h công
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
                              <div className="relative flex items-center justify-between gap-3 z-10 bg-white pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 flex justify-center">
                                    <div
                                      className={`w-3 h-3 rounded-full ring-4 ring-white ${getDotColor(logItem)}`}
                                    ></div>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm tracking-wider">
                                    {logItem.shiftName}
                                  </h4>
                                </div>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${getStatusColor(logItem)}`}
                                >
                                  {logItem.status}
                                </span>
                              </div>

                              <div className="relative flex items-center justify-between gap-6 pl-10">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    Check-in
                                  </p>
                                </div>
                                <span
                                  className={`text-sm font-bold ${logItem.status === "Late" ? "text-orange-600" : "text-slate-700"}`}
                                >
                                  {logItem.checkInTime
                                    ? new Date(
                                        logItem.checkInTime,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "--:--"}
                                </span>
                              </div>

                              <div className="relative flex items-center justify-between gap-6 pl-10">
                                <div>
                                  <p
                                    className={`text-sm font-bold ${logItem.status === "MissingCheckOut" ? "text-rose-600" : "text-slate-800"}`}
                                  >
                                    Check-out
                                  </p>
                                </div>
                                <span
                                  className={`text-sm font-bold ${logItem.status === "MissingCheckOut" ? "text-rose-600" : "text-slate-700"}`}
                                >
                                  {logItem.checkOutTime
                                    ? new Date(
                                        logItem.checkOutTime,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "--:--"}
                                </span>
                              </div>

                              <div className="pl-10 mt-2 flex items-center justify-between">
                                {" "}
                                {/* Thêm flex để căn hàng ngang */}
                                <div>
                                  <div className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600 border border-slate-200">
                                    Tổng giờ làm việc:{" "}
                                    {logItem.workingHours || 0} giờ
                                  </div>
                                  {logItem.note && (
                                    <p className="text-xs text-slate-500 mt-2 italic">
                                      * {logItem.note}
                                    </p>
                                  )}
                                </div>
                                {/* NÚT GIẢI TRÌNH HIỆN RA NẾU CÓ LỖI */}
                                {(logItem.status === "Late" ||
                                  logItem.status === "MissingCheckOut" ||
                                  logItem.status === "EarlyLeave" ||
                                  logItem.status === "Absent") && (
                                  <button
                                    onClick={() => {
                                      setExplainingLog(logItem);
                                      setIsModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 text-xs font-bold transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      edit_document
                                    </span>
                                    Giải trình
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                        weekend
                      </span>
                      <p className="text-sm">
                        Ngày nghỉ. Không có dữ liệu chấm công.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-20">
                  touch_app
                </span>
                <p className="text-sm font-medium">
                  Click vào một ngày để xem chi tiết
                </p>
              </div>
            )}
          </div>
          <ExplanationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            logData={explainingLog}
            onSuccess={() => {
              fetchAttendance();
              alert("Nộp giải trình thành công! Đang chờ Quản lý duyệt.");
            }}
          />
        </div>
      </div>
    </div>
  );
}
