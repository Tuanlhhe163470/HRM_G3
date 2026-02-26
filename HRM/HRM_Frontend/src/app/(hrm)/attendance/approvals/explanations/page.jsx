"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Tag, Button, Modal, Input, message, Avatar } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import attendanceService from "@/services/TimeAndAttendance/attendanceService";

/**
 * PAGE: ExplanationApprovalPage
 * DESCRIPTION: Trung tâm phê duyệt giải trình chấm công dành cho Manager và HR.
 * SENIOR NOTE:
 * 1. Sử dụng useMemo cho columns để tránh re-render không cần thiết và lỗi mất context table.
 * 2. Cơ chế bóc tách dữ liệu linh hoạt (Defensive Programming) xử lý mọi cấu trúc response từ Axios.
 * 3. Force re-render Table bằng cách dùng spread operator [...data].
 */
export default function ExplanationApprovalPage() {
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Khởi tạo mảng trống để tránh lỗi .length
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  // --- BUSINESS LOGIC: FETCH DATA ---
  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getPendingExplanations();
      
      console.log("--- DEBUG DATA ---");
      console.log("1. Biến res trả về:", res);

      let finalData = [];

      // Tự động dò tìm mảng dữ liệu để fix bug "Số lượng đơn: 0"
      if (Array.isArray(res)) {
        finalData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        finalData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        finalData = res.data.data;
      }

      console.log("2. Mảng sau khi bóc tách:", finalData);
      
      // ĐẶC BIỆT QUAN TRỌNG: Dùng Spread Operator để ép React tạo tham chiếu mảng mới.
      // Điều này báo cho Ant Design Table biết dữ liệu đã thay đổi để vẽ lại giao diện.
      setData([...finalData]); 
    } catch (error) {
      console.error("Lỗi Fetch:", error);
      message.error("Không thể tải danh sách chờ duyệt.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // --- BUSINESS LOGIC: REVIEW ACTION ---
  const handleReview = async (id, isApproved) => {
    if (!isApproved && !reviewNote.trim()) {
      return message.warning("Vui lòng nhập lý do nếu bạn từ chối đơn này.");
    }

    try {
      setLoading(true);
      await attendanceService.reviewExplanation(id, {
        isApproved,
        note: reviewNote,
      });

      message.success(isApproved ? "Đã phê duyệt đơn thành công" : "Đã từ chối đơn");
      setIsModalOpen(false);
      setReviewNote("");
      await fetchPendingRequests(); // Reload lại danh sách sau khi duyệt
    } catch (error) {
      message.error(error.response?.data?.Message || "Có lỗi xảy ra khi xử lý");
    } finally {
      setLoading(false);
    }
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  // Định nghĩa columns bên trong useMemo để giữ tham chiếu ổn định
  const columns = useMemo(() => [
    {
      title: "NHÂN VIÊN",
      dataIndex: "employeeName", // Bắt buộc khớp với trường "employeeName" từ Backend
      key: "employee",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatarUrl} className="bg-blue-500">
            {record.employeeName?.charAt(0) || "U"}
          </Avatar>
          <div>
            <p className="font-bold text-slate-800 m-0">
              {record.employeeName || `ID: ${record.employeeId}`}
            </p>
            <p className="text-xs text-slate-500 m-0">{record.shiftName}</p>
          </div>
        </div>
      ),
    },
    {
      title: "LOẠI",
      key: "type",
      render: () => (
        <Tag color="blue" className="rounded-full px-3">
          Giải trình công
        </Tag>
      ),
    },
    {
      title: "LÝ DO / NGÀY",
      key: "reason",
      render: (record) => (
        <div>
          <p className="text-sm font-medium m-0 truncate max-w-[200px]" title={record.reason}>
            {record.reason}
          </p>
          <p className="text-xs text-slate-400 m-0">
            Ngày công: {record.workDate ? new Date(record.workDate).toLocaleDateString("vi-VN") : "---"}
          </p>
        </div>
      ),
    },
    {
      title: "THAY ĐỔI ĐỀ XUẤT",
      key: "change",
      render: (record) => (
        <div className="text-xs space-y-1">
          {record.expectedCheckInTime && (
            <p className="m-0 text-emerald-600 font-medium">
              Vào:{" "}
              {new Date(record.expectedCheckInTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {record.expectedCheckOutTime && (
            <p className="m-0 text-rose-600 font-medium">
              Ra:{" "}
              {new Date(record.expectedCheckOutTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "right",
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            icon={<CheckOutlined className="text-emerald-500" />}
            onClick={() => {
              setSelectedRequest(record);
              setIsModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<CloseOutlined className="text-rose-500" />}
            onClick={() => {
              setSelectedRequest(record);
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ], []);

  // --- RENDER ---
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header Dashboard Style */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Trung tâm Phê duyệt
        </h1>
        <p className="text-slate-500 italic">
          Xem xét và xử lý các yêu cầu chỉnh sửa công từ đội ngũ.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Đang chờ xử lý
          </p>
          <p className="text-3xl font-black text-blue-600 mt-2">
            {data?.length || 0}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 m-0">
            Danh sách yêu cầu giải trình
          </h3>
          <Tag color="blue" className="rounded-full">
            {data?.length || 0} đơn mới
          </Tag>
        </div>
        
        {/* Helper Debug Text (Bạn có thể xóa đi sau khi bảng đã hiện dữ liệu) */}
        <div className="px-6 py-2 text-xs text-gray-400">
          Số lượng đơn đang nạp vào bảng: {data.length}
        </div>

        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id" // Phải đảm bảo viết thường chữ 'id' khớp với JSON từ Backend
          pagination={{ pageSize: 5 }}
          className="custom-table"
          locale={{ emptyText: "Không có dữ liệu chờ duyệt" }}
        />
      </div>

      {/* Modal xử lý chi tiết (Review Modal) */}
      <Modal
        title={
          <span className="font-bold text-lg text-slate-700">
            Chi tiết phê duyệt
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setReviewNote("");
        }}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => handleReview(selectedRequest.id, false)}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            className="bg-blue-600"
            onClick={() => handleReview(selectedRequest.id, true)}
          >
            Phê duyệt
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div className="space-y-4 py-4">
            {/* 1. Lý do của nhân viên */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Lý do từ nhân viên:
              </p>
              <p className="text-sm text-slate-700 font-medium italic m-0">
                &quot;{selectedRequest.reason}&quot;
              </p>
            </div>

            {/* 2. CHỐT CHẶN CỦA MANAGER (Chỉ hiện khi HR xem đơn đã được Manager duyệt) */}
            {selectedRequest.status === "PendingHR" && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckOutlined className="text-emerald-500" />
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest m-0">
                    Quản lý trực tiếp đã bảo lãnh
                  </p>
                </div>
                <p className="text-sm text-slate-700 italic m-0 mt-1">
                  {selectedRequest.managerNote 
                    ? <>&quot;{selectedRequest.managerNote}&quot;</> 
                    : <span className="text-emerald-600/60">(Quản lý đã duyệt nhưng không để lại ghi chú)</span>}
                </p>
              </div>
            )}

            {/* 3. Phần nhập ghi chú của người đang duyệt (Manager hoặc HR) */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Ghi chú của bạn (Tùy chọn):
              </label>
              <Input.TextArea
                placeholder="Nhập lời nhắn cho nhân viên hoặc phòng ban..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}