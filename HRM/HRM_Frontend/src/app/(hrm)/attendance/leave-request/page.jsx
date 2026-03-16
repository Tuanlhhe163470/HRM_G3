"use client";

import React, { useState, useEffect, useCallback } from "react";
// Đã xóa 'message' vì chúng ta dùng custom notice
import { Table, Button, Modal, Form, Select, DatePicker, Input, Tag } from "antd";
import { 
  PlusOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";

import leaveService from "@/services/TimeAndAttendance/attendanceService";
import useNotice from '@/components/Notice';

export default function LeaveRequestPage() {
  const notice = useNotice();

  /**
   * ==========================================
   * 1. STATE MANAGEMENT
   * ==========================================
   */
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dữ liệu hiển thị (Read-only từ Server)
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]); 
  
  // Quản lý UI Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm(); // Hook của Antd để quản lý state Form không cần qua useState

  /**
   * ==========================================
   * 2. DATA INITIALIZATION
   * Fetch các Master Data và lịch sử để build giao diện.
   * Dùng useCallback để hàm này ổn định khi cho vào dependency của useEffect.
   * ==========================================
   */
const fetchInitialData = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      
      const [typesRes, balRes, historyRes] = await Promise.all([
        leaveService.getLeaveTypes(),
        leaveService.getMyBalances(currentYear),
        leaveService.getMyLeaveRequests()
      ]);
      
      setLeaveTypes(Array.isArray(typesRes) ? typesRes : (typesRes?.data || []));
      setLeaveBalances(Array.isArray(balRes) ? balRes : (balRes?.data || []));
      setLeaveHistory(Array.isArray(historyRes) ? historyRes : (historyRes?.data || []));
            
    } catch (error) {
      console.error("[LeaveRequestPage] Fetch initial data error:", error);
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không thể tải dữ liệu nghỉ phép. Vui lòng tải lại trang hoặc thử lại sau.",
        isSuccess: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * ==========================================
   * 3. FORM SUBMISSION HANDLER
   * ==========================================
   * Antd Form đã tự động validate 'required' trước khi gọi hàm này.
   * Tham số 'values' chứa toàn bộ dữ liệu form đã vượt qua bước kiểm duyệt.
   */
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Chuẩn hóa format Date cho Backend (ISO 8601 hoặc yyyy-MM-ddTHH:mm:ss)
      const payload = {
        leaveTypeId: values.leaveTypeId,
        startDate: dayjs(values.dateRange[0]).format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dayjs(values.dateRange[1]).format("YYYY-MM-DDTHH:mm:ss"),
        reason: values.reason
      };

      await leaveService.submitLeaveRequest(payload);
      
      notice({
        msg: "Gửi đơn thành công",
        desc: "Đơn xin nghỉ phép của bạn đã được gửi và đang chờ Quản lý phê duyệt.",
        isSuccess: true
      });
      
      // Cleanup UI
      setIsModalOpen(false);
      form.resetFields(); // Reset form về rỗng cho lần nộp tiếp theo
      
      // Background Refresh: Nạp lại lịch sử và số dư phép ngầm bên dưới
      fetchInitialData();
    } catch (error) {
      notice({
        msg: "Gửi đơn thất bại",
        desc: error.response?.data?.Message || "Có lỗi xảy ra khi nộp đơn, vui lòng kiểm tra lại!",
        isSuccess: false
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * ==========================================
   * 4. TABLE COLUMNS CONFIGURATION
   * ==========================================
   */
  const columns = [
    {
      title: "LOẠI PHÉP",
      dataIndex: "leaveTypeName",
      key: "leaveTypeName",
      render: (text) => <span className="font-semibold text-slate-700">{text || "Phép năm"}</span>,
    },
    {
      title: "THỜI GIAN NGHỈ",
      key: "time",
      render: (record) => (
        <div className="text-sm">
          <p className="m-0 text-slate-600">Từ: {dayjs(record.startDate).format("DD/MM/YYYY HH:mm")}</p>
          <p className="m-0 text-slate-600">Đến: {dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}</p>
        </div>
      ),
    },
    {
      title: "LÝ DO",
      dataIndex: "reason",
      key: "reason",
      // UI Trick: Dùng line-clamp để text dài không làm vỡ bảng, người dùng có thể hover vào hoặc click xem chi tiết (nếu sau này phát triển thêm Modal View)
      render: (text) => <span className="text-slate-500 italic line-clamp-2 max-w-xs">{text}</span>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        // Ánh xạ trạng thái dựa theo Enum từ Backend
        if (status === 1 || status === 2) return <Tag icon={<ClockCircleOutlined />} color="warning">Đang chờ duyệt</Tag>;
        if (status === 3) return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>;
        if (status === 4) return <Tag icon={<CloseCircleOutlined />} color="error">Từ chối</Tag>;
        return <Tag color="default">Không xác định</Tag>;
      },
    },
  ];

  /**
   * ==========================================
   * 5. DERIVED STATE / COMPUTED VALUES
   * ==========================================
   */
  // Tìm quỹ phép năm (Giả định leaveTypeId = 1 là ID cứng của Phép năm, có thể cần đổi logic nếu ID động)
  const annualBalance = leaveBalances.find(b => b.leaveTypeId === 1) || { remainingDays: 0, totalDays: 0, usedDays: 0 };

  // ... (Toàn bộ phần RENDER JSX bên dưới giữ nguyên thiết kế của bạn)
  // ...
  
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* HEADER TÍNH NĂNG */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight m-0">
            Quản lý Nghỉ phép
          </h1>
          <p className="text-slate-500 italic mt-1 text-sm">
            Theo dõi quỹ phép và nộp đơn xin nghỉ phép của bạn.
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-blue-600 h-10 px-6 font-bold rounded-lg shadow-md hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          Nộp đơn nghỉ phép
        </Button>
      </div>

      {/* KHỐI THỐNG KÊ (WIDGETS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card: Phép Năm */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CalendarOutlined className="text-xl" />
            </div>
            <Tag color="purple" className="rounded-full border-none font-bold">NĂM {new Date().getFullYear()}</Tag>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 mb-1">Số phép còn lại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{annualBalance.remainingDays}</span>
              <span className="text-sm font-medium text-slate-400">Ngày</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs text-slate-500">
              <span>Tổng: <strong>{annualBalance.totalDays}</strong></span>
              <span>Đã nghỉ: <strong>{annualBalance.usedDays}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG LỊCH SỬ ĐƠN TỪ (TABLE) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white/50">
          <h3 className="font-bold text-slate-700 m-0">Lịch sử đơn nghỉ phép</h3>
        </div>
        <Table
          dataSource={leaveHistory}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Bạn chưa nộp đơn nghỉ phép nào." }}
          className="custom-table"
        />
      </div>

      {/* MODAL FORM XIN NGHỈ PHÉP */}
      <Modal
        title={<span className="font-black text-xl text-slate-800">Tạo Đơn Xin Nghỉ Phép</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        onOk={() => form.submit()}
        okText="Gửi đơn"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-blue-600 font-bold rounded-lg" }}
        cancelButtonProps={{ className: "rounded-lg" }}
        width={600}
        centered
      >
        <div className="py-4">
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 items-start">
            <span className="text-blue-500 mt-0.5">💡</span>
            <p className="text-sm text-slate-600 m-0 leading-relaxed">
              Bạn đang có <strong className="text-blue-600">{annualBalance.remainingDays} ngày</strong> phép năm. 
              Vui lòng chọn khoảng thời gian và mô tả lý do chi tiết để Quản lý dễ dàng xét duyệt nhé.
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="leaveTypeId"
              label={<span className="font-bold text-slate-700">Loại nghỉ phép</span>}
              rules={[{ required: true, message: 'Vui lòng chọn loại phép!' }]}
            >
              <Select 
                placeholder="Chọn loại phép (Ví dụ: Phép năm, Nghỉ ốm...)"
                size="large"
                className="rounded-lg"
              >
                {leaveTypes.map(type => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name} {type.isPaidLeave ? "(Hưởng lương)" : "(Không lương)"}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label={<span className="font-bold text-slate-700">Thời gian nghỉ (Bắt đầu - Kết thúc)</span>}
              rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian!' }]}
            >
              <DatePicker.RangePicker 
                showTime={{ format: 'HH:mm' }} 
                format="DD/MM/YYYY HH:mm"
                className="w-full" 
                size="large"
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label={<span className="font-bold text-slate-700">Lý do nghỉ</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập lý do!' },
                { min: 10, message: 'Lý do hơi ngắn, hãy mô tả chi tiết hơn một chút nhé.' }
              ]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Ví dụ: Xin nghỉ phép năm để giải quyết việc gia đình..." 
                className="rounded-lg"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

    </div>
  );
}