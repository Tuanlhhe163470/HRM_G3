"use client";
import React, { useState } from "react";
import attendanceService from "@/services/TimeAndAttendance/attendanceService";

/**
 * ==========================================
 * EXPLANATION MODAL (COMPONENT CON)
 * ==========================================
 * Component này nhận dữ liệu từ cha (TimesheetPage) qua props.
 * Nó chịu trách nhiệm xử lý logic Form nộp giải trình và gọi API submit.
 */
export default function ExplanationModal({
  isOpen,
  onClose,
  logData,
  onSuccess, // Truyền function từ cha xuống để kích hoạt Notice và Reload data
  onError    // Truyền function từ cha xuống để hiển thị Notice lỗi
}) {
  const [reason, setReason] = useState("");
  const [expectedIn, setExpectedIn] = useState("");
  const [expectedOut, setExpectedOut] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Early return: Nếu modal không mở hoặc không có data thì không render gì cả (Tiết kiệm DOM)
  if (!isOpen || !logData) return null;

  // Extract chuỗi ngày (VD: "2026-02-04") để ghép với giờ người dùng nhập
  const logDateStr = new Date(logData.workDate).toISOString().split("T")[0];

  /**
   * FORM SUBMIT HANDLER
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Chuẩn bị payload: Ghép chuỗi Ngày của logData với Giờ người dùng chọn
      const expectedCheckInTime = expectedIn ? `${logDateStr}T${expectedIn}:00` : null;
      const expectedCheckOutTime = expectedOut ? `${logDateStr}T${expectedOut}:00` : null;

      const payload = {
        attendanceLogId: logData.id,
        reason: reason,
        expectedCheckInTime: expectedCheckInTime,
        expectedCheckOutTime: expectedCheckOutTime,
        proofUrl: null, // Mở rộng sau nếu có chức năng upload ảnh/minh chứng
      };

      await attendanceService.submitExplanation(payload);

      // Reset state form về ban đầu
      setReason("");
      setExpectedIn("");
      setExpectedOut("");
      
      // Kích hoạt callback từ component cha (Để cha reload lại lịch và báo thành công)
      onSuccess();
      onClose();
    } catch (error) {
      // Kích hoạt callback lỗi lên cha
      onError(error.response?.data?.Message || "Có lỗi xảy ra khi gửi đơn giải trình.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Modal Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Nộp giải trình chấm công</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Box thông tin ca bị lỗi */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-bold mb-1">
              Đang giải trình cho ca:
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {logData.shiftName}
            </p>
            <p className="text-xs text-slate-500">
              Ngày: {new Date(logData.workDate).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-slate-700">
              Lý do giải trình <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Quên bấm điện thoại, đi gặp khách hàng..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[100px] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Giờ Vào (Check-in) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Giờ vào đúng
              </label>
              <input
                type="time"
                value={
                  logData.checkInTime
                    ? new Date(logData.checkInTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : expectedIn
                }
                onChange={(e) => setExpectedIn(e.target.value)}
                disabled={!!logData.checkInTime} // Disable nếu hệ thống đã ghi nhận đúng giờ vào
                className={`w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none transition-all
                  ${logData.checkInTime ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"}
                `}
              />
            </div>
            
            {/* Input Giờ Ra (Check-out) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Giờ ra đúng
              </label>
              <input
                type="time"
                value={
                  logData.checkOutTime
                    ? new Date(logData.checkOutTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : expectedOut
                }
                onChange={(e) => setExpectedOut(e.target.value)}
                disabled={!!logData.checkOutTime} // Disable nếu hệ thống đã ghi nhận đúng giờ ra
                className={`w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none transition-all
                  ${logData.checkOutTime ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"}
                `}
              />
            </div>
          </div>

          {/* Modal Footer (Actions) */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-md shadow-blue-200"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi Đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}