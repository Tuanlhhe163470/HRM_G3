"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Tag, Button, Modal, Input, Avatar } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

import attendanceService from "@/services/TimeAndAttendance/attendanceService";
import useNotice from '@/components/Notice'; 

export default function ExplanationApprovalPage() {
  const notice = useNotice();

  /**
   * STATE MANAGEMENT
   */
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  /**
   * DATA FETCHING
   * Fetch pending explanations and normalize the API response.
   */
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getPendingExplanations();
      
      let finalData = [];

      if (Array.isArray(res)) {
        finalData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        finalData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        finalData = res.data.data;
      }

      setData([...finalData]); 
    } catch (error) {
      console.error("[ExplanationApprovalPage] fetch error:", error);
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không thể tải danh sách chờ duyệt. Vui lòng thử lại sau.",
        isSuccess: false
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  /**
   * EVENT HANDLERS
   * Xử lý logic phê duyệt/từ chối đơn giải trình.
   */
  const handleReview = async (id, isApproved) => {
    // Validate: Bắt buộc nhập lý do nếu từ chối (Reject)
    if (!isApproved && !reviewNote.trim()) {
      return notice({
        msg: "Thiếu thông tin",
        desc: "Vui lòng nhập lý do nếu bạn từ chối đơn này.",
        isSuccess: false
      });
    }

    try {
      setLoading(true);
      await attendanceService.reviewExplanation(id, {
        isApproved,
        note: reviewNote,
      });

      notice({
        msg: isApproved ? "Phê duyệt thành công" : "Đã từ chối đơn",
        desc: `Đơn giải trình đã được ${isApproved ? 'chấp thuận' : 'từ chối'} và cập nhật vào hệ thống.`,
        isSuccess: true
      });

      // Cleanup & Refresh
      setIsModalOpen(false);
      setReviewNote("");
      await fetchPendingRequests(); 
    } catch (error) {
      notice({
        msg: "Lỗi xử lý",
        desc: error.response?.data?.Message || "Có lỗi xảy ra khi xử lý yêu cầu này.",
        isSuccess: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * TABLE CONFIGURATION
   * Memoized để tránh re-render Table headers không cần thiết.
   */
  const columns = useMemo(() => [
    {
      title: "NHÂN VIÊN",
      dataIndex: "employeeName", 
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Trung tâm Phê duyệt
        </h1>
        <p className="text-slate-500 italic">
          Xem xét và xử lý các yêu cầu chỉnh sửa công từ đội ngũ.
        </p>
      </div>

      {/* Stats Board */}
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

      {/* Data Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 m-0">
            Danh sách yêu cầu giải trình
          </h3>
          <Tag color="blue" className="rounded-full">
            {data?.length || 0} đơn mới
          </Tag>
        </div>
        
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id" 
          pagination={{ pageSize: 5 }}
          className="custom-table"
          locale={{ emptyText: "Không có dữ liệu chờ duyệt" }}
        />
      </div>

      {/* Review Workflow Modal */}
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
            {/* 1. Original Request Reason */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Lý do từ nhân viên:
              </p>
              <p className="text-sm text-slate-700 font-medium italic m-0">
                &quot;{selectedRequest.reason}&quot;
              </p>
            </div>

            {/* 2. Direct Manager Endorsement (Visible to HR only if pre-approved) */}
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

            {/* 3. Reviewer's Note Input */}
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