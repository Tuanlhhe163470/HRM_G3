"use client";
import React, { useState, useEffect } from "react";
import overtimeService from "@/services/TimeAndAttendance/overtimeService";
import useNotice from "@/components/Notice";

export default function MyOvertimePage() {
  const notice = useNotice();
  const [overtimes, setOvertimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Form tạo mới
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyOvertimes = async () => {
    try {
      const res = await overtimeService.getMyOvertimes();

      const dataList = res.data || res;

      setOvertimes(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không lấy được danh sách OT",
        isSuccess: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case 1:
        return {
          text: "Chờ Quản lý duyệt",
          css: "bg-amber-100 text-amber-700",
        };
      case 2:
        return { text: "Chờ HR duyệt", css: "bg-blue-100 text-blue-700" };
      case 3:
        return { text: "Đã duyệt", css: "bg-emerald-100 text-emerald-700" };
      case 4:
        return { text: "Từ chối", css: "bg-rose-100 text-rose-700" };
      default:
        return { text: "Không xác định", css: "bg-slate-100 text-slate-500" };
    }
  };

  useEffect(() => {
    fetchMyOvertimes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await overtimeService.submitOvertime(formData);
      notice({ msg: "Thành công", desc: "Đã gửi đơn xin OT", isSuccess: true });
      setShowModal(false);
      setFormData({ date: "", startTime: "", endTime: "", reason: "" });
      fetchMyOvertimes(); // Tải lại danh sách
    } catch (error) {
      notice({
        msg: "Lỗi",
        desc: error.response?.data?.Message || "Lỗi gửi đơn",
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
          Đơn làm thêm giờ (OT)
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          + Tạo đơn OT mới
        </button>
      </div>

      {/* Bảng danh sách OT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Thời gian xin</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3">Giờ được duyệt</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : (
              overtimes.map((ot) => {
                // 🌟 GỌI HÀM HELPER Ở ĐÂY CHO TỪNG RECORD
                const statusUI = getStatusUI(ot.status);

                return (
                  <tr key={ot.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      {new Date(ot.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      {ot.startTime} - {ot.endTime}
                    </td>
                    <td className="px-4 py-3">{ot.reason}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">
                      {ot.approvedHours || 0}h
                    </td>
                    <td className="px-4 py-3">
                      {/* 🌟 RENDER UI SẠCH SẼ VÀ RÕ RÀNG */}
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold ${statusUI.css}`}
                      >
                        {statusUI.text}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo đơn (Code Modal đơn giản viết gọn) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h3 className="font-bold text-lg mb-4">Tạo đơn xin OT</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="date"
                required
                className="border p-2 rounded"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />

              <div className="flex gap-2">
                <input
                  type="time"
                  required
                  className="border p-2 rounded w-full"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  required
                  className="border p-2 rounded w-full"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="Lý do làm thêm..."
                required
                className="border p-2 rounded h-24"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
