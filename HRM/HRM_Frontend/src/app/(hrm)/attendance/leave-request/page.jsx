"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Select, DatePicker, Input, message, Tag } from "antd";
import { PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import leaveService from "@/services/TimeAndAttendance/attendanceService";
import dayjs from "dayjs";

export default function LeaveRequestPage() {
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]); // Chứa lịch sử đơn đã nộp
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // --- FETCH DATA ---
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      
      // 1. Lấy danh mục loại phép
      const typesRes = await leaveService.getLeaveTypes();
      const typesData = Array.isArray(typesRes) ? typesRes : (typesRes?.data || []);
      setLeaveTypes(typesData);

      // 2. Lấy số dư phép năm
      const balRes = await leaveService.getMyBalances(currentYear);
      const balData = Array.isArray(balRes) ? balRes : (balRes?.data || []);
      setLeaveBalances(balData);

      // 3. Lấy lịch sử nộp đơn (Tạm thời để mảng rỗng chờ viết API)
      // 3. Lấy lịch sử nộp đơn
      const historyRes = await leaveService.getMyLeaveRequests();
      const historyData = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
      setLeaveHistory(historyData);
            
    } catch (error) {
      console.error("Lỗi tải dữ liệu Nghỉ phép:", error);
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- XỬ LÝ NỘP ĐƠN ---
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        leaveTypeId: values.leaveTypeId,
        startDate: dayjs(values.dateRange[0]).format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dayjs(values.dateRange[1]).format("YYYY-MM-DDTHH:mm:ss"),
        reason: values.reason
      };

      await leaveService.submitLeaveRequest(payload);
      
      message.success("Đã nộp đơn xin nghỉ phép thành công! Đang chờ duyệt.");
      setIsModalOpen(false);
      form.resetFields();
      
      // Tải lại dữ liệu sau khi nộp
      fetchInitialData();
    } catch (error) {
      const errorMsg = error.response?.data?.Message || "Có lỗi xảy ra khi nộp đơn!";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- CẤU HÌNH BẢNG LỊCH SỬ (Ant Design Table) ---
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
      render: (text) => <span className="text-slate-500 italic line-clamp-2 max-w-xs">{text}</span>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        // Ánh xạ trạng thái dựa theo Enum của bạn
        if (status === 1 || status === 2) return <Tag icon={<ClockCircleOutlined />} color="warning">Đang chờ duyệt</Tag>;
        if (status === 3) return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>;
        if (status === 4) return <Tag icon={<CloseCircleOutlined />} color="error">Từ chối</Tag>;
        return <Tag color="default">Không xác định</Tag>;
      },
    },
  ];

  // Tìm quỹ phép năm để hiển thị nổi bật
  const annualBalance = leaveBalances.find(b => b.leaveTypeId === 1) || { remainingDays: 0, totalDays: 0, usedDays: 0 };

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

        {/* Các Card khác có thể bổ sung sau (Nghỉ ốm, Thai sản...) */}
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