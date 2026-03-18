// src/app/(hrm)/attendance/explanation/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import explanationService from "@/services/TimeAndAttendance/explanationService";
import useNotice from "@/components/Notice";

export default function AttendanceExplanationPage() {
  const notice = useNotice();
  const [explanations, setExplanations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data dựa trên SubmitExplanationRequest ở Backend
  const [formData, setFormData] = useState({
    attendanceLogId: "",
    reason: "",
    expectedCheckInTime: "",
    expectedCheckOutTime: "",
  });

  const fetchMyExplanations = async () => {
    try {
      const res = await explanationService.getMyExplanations();
      const dataList = res.data || res;

      setExplanations(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      notice({
        msg: "Lỗi",
        desc: "Không tải được danh sách giải trình",
        isSuccess: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyExplanations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await explanationService.submitExplanation(formData);
      notice({
        msg: "Thành công",
        desc: "Đã gửi đơn giải trình",
        isSuccess: true,
      });
      setShowModal(false);
      setFormData({
        attendanceLogId: "",
        reason: "",
        expectedCheckInTime: "",
        expectedCheckOutTime: "",
      });
      fetchMyExplanations();
    } catch (error) {
      notice({
        msg: "Thất bại",
        desc: error.response?.data?.message || "Lỗi khi gửi đơn",
        isSuccess: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Giải trình chấm công
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Tạo giải trình mới
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Mã ca (Log ID)</th>
              <th className="px-4 py-3">Lý do giải trình</th>
              <th className="px-4 py-3">Giờ mong muốn (In-Out)</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : explanations.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">
                  Bạn chưa có đơn giải trình nào.
                </td>
              </tr>
            ) : (
              explanations.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-blue-600">
                    #{exp.attendanceLogId}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{exp.reason}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {exp.expectedCheckInTime
                      ? new Date(exp.expectedCheckInTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "--"}
                    {" - "}
                    {exp.expectedCheckOutTime
                      ? new Date(exp.expectedCheckOutTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "--"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(exp.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    {/* 🌟 FIX 2: So sánh bằng chuỗi (String) thay vì Số nguyên */}
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold ${
                        exp.status === "PendingManager"
                          ? "bg-amber-100 text-amber-700"
                          : exp.status === "PendingHR"
                            ? "bg-blue-100 text-blue-700"
                            : exp.status === "Approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {exp.status === "PendingManager"
                        ? "Chờ Manager"
                        : exp.status === "PendingHR"
                          ? "Chờ HR"
                          : exp.status === "Approved"
                            ? "Đã duyệt"
                            : "Từ chối"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tạo đơn */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-xl mb-1 text-slate-800">
              Nộp đơn giải trình
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              Vui lòng cung cấp thông tin chính xác để HR đối soát.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mã ca làm việc (Log ID)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 102"
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.attendanceLogId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attendanceLogId: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Giờ vào mong muốn
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
                    value={formData.expectedCheckInTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedCheckInTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Giờ ra mong muốn
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
                    value={formData.expectedCheckOutTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedCheckOutTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Lý do cụ thể
                </label>
                <textarea
                  placeholder="Quên quẹt thẻ, đi trễ do hỏng xe..."
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg h-28 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
                >
                  {isSubmitting ? "Đang xử lý..." : "Gửi giải trình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
