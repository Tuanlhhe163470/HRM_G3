"use client";
import React, { useState, useEffect } from "react";
import overtimeService from "@/services/TimeAndAttendance/overtimeService";
import useNotice from "@/components/Notice";

export default function OTApprovalPage() {
  const notice = useNotice();
  const [pendingRequests, setPendingRequests] = useState([]);

  // States cho việc Review (Duyệt)
  const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
  const [reviewForm, setReviewForm] = useState({
    approvedHours: 0,
    managerNote: "",
  });

  const fetchPending = async () => {
    try {
      const res = await overtimeService.getPendingOvertimes();

      const dataList = res.data || res;

      setPendingRequests(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      notice({
        msg: "Lỗi",
        desc: "Không thể lấy danh sách chờ duyệt",
        isSuccess: false,
      });
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openReview = (ot) => {
    setReviewModal({ isOpen: true, data: ot });
    // Tạm tính số giờ xin mặc định để gợi ý cho Quản lý (Ví dụ: HR tự nhập số đẹp)
    setReviewForm({ approvedHours: 0, managerNote: "" });
  };

  const handleReviewSubmit = async (isApprovedBtn) => {
    try {
      // 1. Sửa lại Payload cho khớp y chang với DTO của Backend C#
      const payload = {
        isApproved: isApprovedBtn, // Truyền thẳng true (Phê duyệt) hoặc false (Từ chối)
        note: reviewForm.managerNote,
        // Đã XÓA biến approvedHours vì Manager không có quyền chốt số giờ này
      };

      // Vẫn gọi API bình thường
      await overtimeService.reviewOvertime(reviewModal.data.id, payload);

      notice({ msg: "Thành công", desc: "Đã xử lý đơn OT", isSuccess: true });
      setReviewModal({ isOpen: false, data: null });
      fetchPending();
    } catch (error) {
      // 2. Bóc tách lỗi Backend để hiển thị chính xác (VD: "Bắt buộc nhập lý do...")
      notice({
        msg: "Lỗi",
        desc: error.response?.data?.message || "Có lỗi khi xử lý đơn",
        isSuccess: false,
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Duyệt đơn Làm thêm giờ (OT)
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Ngày xin</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-slate-500">
                  Không có đơn nào chờ duyệt.
                </td>
              </tr>
            ) : (
              pendingRequests.map((ot) => (
                <tr key={ot.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{ot.employeeName}</td>
                  <td className="px-4 py-3">
                    {new Date(ot.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-orange-600 font-bold">
                    {ot.startTime} - {ot.endTime}
                  </td>
                  <td className="px-4 py-3">{ot.reason}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openReview(ot)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold hover:bg-blue-200"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DUYỆT ĐƠN */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[450px]">
            <h3 className="font-bold text-lg mb-2">Xử lý đơn OT</h3>
            <p className="text-sm text-slate-600 mb-4">
              Nhân viên: <b>{reviewModal.data?.employeeName}</b>
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Số giờ công nhận (Approved Hours):
                </label>
                <input
                  type="number"
                  step="0.5" // Cho phép lẻ 0.5 giờ
                  className="w-full border p-2 rounded mt-1 text-emerald-600 font-bold"
                  value={reviewForm.approvedHours}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      approvedHours: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Ghi chú của Quản lý:
                </label>
                <textarea
                  className="w-full border p-2 rounded mt-1"
                  placeholder="VD: Duyệt 2 tiếng, nhớ commit code đầy đủ..."
                  value={reviewForm.managerNote}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      managerNote: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setReviewModal({ isOpen: false, data: null })}
                  className="..."
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleReviewSubmit(false)}
                  className="..."
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleReviewSubmit(true)}
                  className="..."
                >
                  Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
