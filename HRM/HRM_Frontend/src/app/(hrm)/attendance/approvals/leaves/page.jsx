"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Tag, Button, Modal, Input, message, Avatar } from "antd";
import { CheckOutlined, CloseOutlined, CalendarOutlined } from "@ant-design/icons";
import attendanceService from "@/services/TimeAndAttendance/attendanceService";
import dayjs from "dayjs";

export default function LeaveApprovalPage() {
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  // --- FETCH DATA ---
  const fetchPendingLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getPendingLeaveRequests();
      
      // Bóc tách dữ liệu phòng thủ (Defensive Programming)
      let rawData = [];
      if (Array.isArray(res)) rawData = res;
      else if (res?.data && Array.isArray(res.data)) rawData = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) rawData = res.data.data;

      setData([...rawData]); 
    } catch (error) {
      console.error("Lỗi tải danh sách chờ duyệt:", error);
      message.error("Không thể tải danh sách đơn nghỉ phép.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLeaves();
  }, [fetchPendingLeaves]);

  // --- XỬ LÝ PHÊ DUYỆT ---
  const handleReview = async (id, isApproved) => {
    if (!isApproved && !reviewNote.trim()) {
      return message.warning("Vui lòng nhập lý do nếu bạn từ chối đơn này.");
    }

    try {
      setLoading(true);
      await attendanceService.reviewLeaveRequest(id, {
        isApproved,
        note: reviewNote,
      });

      message.success(isApproved ? "Đã phê duyệt đơn nghỉ phép." : "Đã từ chối đơn.");
      setIsModalOpen(false);
      setReviewNote("");
      await fetchPendingLeaves(); // Refresh dữ liệu
    } catch (error) {
      const errorMsg = error.response?.data?.Message || "Có lỗi xảy ra khi xử lý hệ thống.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = useMemo(() => [
    {
      title: "NHÂN VIÊN",
      dataIndex: "employeeName", // Tuỳ thuộc Backend bạn trả về tên hay ID
      key: "employee",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-purple-500 font-bold">
            {record.employeeName?.charAt(0) || "U"}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 leading-tight">
              {record.employeeName || `ID: ${record.employeeId}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "LOẠI PHÉP",
      key: "leaveType",
      width: 180,
      render: (record) => (
        <Tag color="purple" className="rounded-full px-3 border-none bg-purple-50 text-purple-600 font-bold">
          {record.leaveTypeName || "Nghỉ phép"}
        </Tag>
      ),
    },
    {
      title: "THỜI GIAN ĐỀ XUẤT",
      key: "time",
      width: 200,
      render: (record) => (
        <div className="flex flex-col gap-1 text-[12px] font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-emerald-600">Từ:</span> 
            {dayjs(record.startDate).format("DD/MM/YYYY HH:mm")}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-500">Đến:</span> 
            {dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "LÝ DO",
      key: "reason",
      render: (record) => (
        <p className="text-sm text-slate-600 m-0 font-medium line-clamp-2 italic" title={record.reason}>
          &quot;{record.reason}&quot;
        </p>
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      align: "right",
      width: 120,
      render: (record) => (
        <div className="flex justify-end gap-1">
          <Button
            type="text"
            className="hover:bg-emerald-50 text-emerald-500"
            icon={<CheckOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              setIsModalOpen(true);
            }}
          />
          <Button
            type="text"
            className="hover:bg-rose-50 text-rose-500"
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight m-0">
            Duyệt Nghỉ Phép
          </h1>
          <p className="text-slate-500 italic mt-1 text-sm">
            Xem xét và xử lý các đơn xin nghỉ phép từ đội ngũ.
          </p>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest m-0 flex items-center gap-2">
            <CalendarOutlined /> Đang chờ duyệt
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-purple-600">
              {data?.length || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">yêu cầu mới</span>
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white/50">
          <h3 className="font-bold text-slate-700 m-0">Danh sách đơn chờ duyệt</h3>
        </div>
        
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id" 
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          className="custom-approval-table"
          locale={{ emptyText: 'Hiện tại chưa có đơn nghỉ phép nào cần phê duyệt.' }}
        />
      </div>

      {/* REVIEW ACTION MODAL */}
      <Modal
        title={<span className="font-black text-xl text-slate-800 tracking-tight">Chi tiết đơn xin nghỉ</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setReviewNote("");
        }}
        centered
        width={500}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)} className="rounded-lg font-medium">
            Quay lại
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => handleReview(selectedRequest.id, false)}
            className="rounded-lg font-bold"
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            className="bg-purple-600 rounded-lg font-bold shadow-purple-200 shadow-lg border-none hover:bg-purple-700"
            onClick={() => handleReview(selectedRequest.id, true)}
          >
            Phê duyệt ngay
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div className="space-y-6 py-4">
            {/* THÔNG TIN CHI TIẾT */}
            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                    <p className="text-sm font-bold text-slate-700 m-0">{dayjs(selectedRequest.startDate).format("DD/MM/YYYY HH:mm")} - {dayjs(selectedRequest.endDate).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loại phép</p>
                    <Tag color="purple" className="m-0 font-bold">{selectedRequest.leaveTypeName}</Tag>
                </div>
            </div>

            {/* LÝ DO NHÂN VIÊN */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">
                Lý do xin nghỉ:
              </p>
              <p className="text-sm text-slate-700 font-medium italic leading-relaxed m-0">
                &quot;{selectedRequest.reason}&quot;
              </p>
            </div>

            {/* HIỂN THỊ NOTE CỦA MANAGER NẾU LÀ HR ĐANG DUYỆT */}
            {selectedRequest.status === 2 && ( // 2 = PendingHR
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

            {/* PHẦN NHẬP GHI CHÚ */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Phản hồi của bạn:
              </label>
              <Input.TextArea
                placeholder="Nhập ghi chú hoặc lý do từ chối (bắt buộc nếu từ chối)..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={4}
                className="rounded-xl border-slate-200 focus:border-purple-400 hover:border-purple-300 transition-all"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}