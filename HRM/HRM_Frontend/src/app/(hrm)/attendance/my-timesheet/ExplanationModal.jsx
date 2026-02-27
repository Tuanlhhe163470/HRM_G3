"use client";
import React, { useState } from "react";
import attendanceService from "@/services/TimeAndAttendance/attendanceService";

export default function ExplanationModal({
  isOpen,
  onClose,
  logData,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [expectedIn, setExpectedIn] = useState("");
  const [expectedOut, setExpectedOut] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !logData) return null;

  // Cắt chuỗi ngày (VD: "2026-02-04") để ghép với giờ
  const logDateStr = new Date(logData.workDate).toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const expectedCheckInTime = expectedIn
        ? `${logDateStr}T${expectedIn}:00`
        : null;
      const expectedCheckOutTime = expectedOut
        ? `${logDateStr}T${expectedOut}:00`
        : null;

      const payload = {
        attendanceLogId: logData.id,
        reason: reason,
        expectedCheckInTime: expectedCheckInTime,
        expectedCheckOutTime: expectedCheckOutTime,
        proofUrl: null,
      };

      // 2. Gọi API Service
      await attendanceService.submitExplanation(payload);

      // 3. Reset form và báo thành công
      setReason("");
      setExpectedIn("");
      setExpectedOut("");
      onSuccess();
      onClose();
    } catch (error) {
      setErrorMsg(
        error.response?.data?.Message || "Có lỗi xảy ra khi gửi đơn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Nộp giải trình chấm công</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
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

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-slate-700">
              Lý do giải trình <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Quên bấm điện thoại, đi gặp khách hàng..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Giờ vào đúng
              </label>
              <input
                type="time"
                value={
                  logData.checkInTime
                    ? new Date(logData.checkInTime).toLocaleTimeString(
                        "en-GB",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : expectedIn
                }
                onChange={(e) => setExpectedIn(e.target.value)}
                disabled={!!logData.checkInTime}
                className={`w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none 
                  ${logData.checkInTime ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500 bg-white"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Giờ ra đúng
              </label>
              <input
                type="time"
                // Tương tự cho Check-out
                value={
                  logData.checkOutTime
                    ? new Date(logData.checkOutTime).toLocaleTimeString(
                        "en-GB",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : expectedOut
                }
                onChange={(e) => setExpectedOut(e.target.value)}
                disabled={!!logData.checkOutTime}
                className={`w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none 
                  ${logData.checkOutTime ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500 bg-white"}`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi Đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
