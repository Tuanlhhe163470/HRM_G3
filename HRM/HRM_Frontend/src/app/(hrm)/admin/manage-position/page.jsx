"use client";

import React, { useEffect, useState } from "react";
import {
  Table, Button, Space, Card, Typography, Avatar, Form, Input, App, Tooltip
} from "antd";
import {
  SolutionOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined,
  PhoneOutlined, UserOutlined, ExclamationCircleOutlined, EyeOutlined, CalendarOutlined
} from "@ant-design/icons";

import positionService from "@/services/Position/positionService"; 
import employeeService from "@/services/HRCore/employeeService";
import CustomModal from "@/components/Modal/CustomModal";
import dayjs from "dayjs";

const { Text } = Typography;

export default function PositionManagementPage() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  // States quản lý dữ liệu vị trí
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // States quản lý Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // States quản lý Modal Xóa
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // States quản lý Modal Xem chi tiết nhân viên
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [employeesInPosition, setEmployeesInPosition] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [viewingPositionName, setViewingPositionName] = useState("");

  // 1. Lấy danh sách Vị trí
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await positionService.getAll();
      setData(res?.data || res || []);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể tải danh sách vị trí" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Mở Modal Thêm mới
  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setSelectedId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 3. Mở Modal Chỉnh sửa
  const handleOpenEdit = (record) => {
    setIsCreateMode(false);
    // Lưu ý: Đảm bảo trường ID trùng khớp với Backend (positionID hoặc id)
    setSelectedId(record.positionID || record.id); 
    
    // Chỉ set tên vị trí vì yêu cầu chỉ cho sửa tên
    form.setFieldsValue({
      positionName: record.positionName || record.name,
    });
    
    setIsModalOpen(true);
  };

  // 4. Mở Modal Xem danh sách nhân viên
  const handleOpenView = async (record) => {
    setViewingPositionName(record.positionName || record.name);
    setIsViewModalOpen(true);
    setLoadingEmployees(true);
    
    try {
      // Lấy toàn bộ nhân viên và lọc ra những người có positionID tương ứng
      // (Nếu Backend của bạn có API getEmployeesByPosition thì dùng API đó sẽ tối ưu hơn)
      const res = await employeeService.getAll({ PageNumber: 1, PageSize: 1000 });
      const allEmps = res?.data?.data || res?.data || res || [];
      
      const targetPosId = record.positionID || record.id;
      const filteredEmps = allEmps.filter(emp => 
        emp.positionID === targetPosId || emp.position?.id === targetPosId
      );
      
      setEmployeesInPosition(filteredEmps);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể tải danh sách nhân viên ở vị trí này." });
    } finally {
      setLoadingEmployees(false);
    }
  };

  // 5. Xử lý Submit Thêm/Sửa
  const onFinish = async (values) => {
    try {
      if (isCreateMode) {
        await positionService.create(values);
        notification.success({ title: "Thành công", description: "Đã tạo vị trí mới." });
      } else {
        await positionService.update(selectedId, values);
        notification.success({ title: "Thành công", description: "Cập nhật tên vị trí thành công." });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({
        title: "Thao tác thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại dữ liệu.",
      });
    }
  };

  // 6. Xử lý Xóa
  const handleDelete = async () => {
    try {
      await positionService.delete(deleteId);
      notification.success({ title: "Thành công", description: "Đã xóa vị trí." });
      setIsConfirmOpen(false);
      fetchData();
    } catch (error) {
      setIsConfirmOpen(false); 
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || (typeof errorData === 'string' ? errorData : "Không thể xóa vị trí lúc này.");

      notification.warning({
        message: "Không thể thực hiện",
        description: errorMessage,
      });
    }
  };

  // --- CỘT BẢNG VỊ TRÍ ---
  const columns = [
    {
      title: "Tên chức danh / Vị trí",
      dataIndex: "positionName", // Hoặc "name" tùy cấu trúc API
      render: (text, record) => (
        <Space>
          <Avatar icon={<SolutionOutlined />} className="bg-[#154398]" />
          <Text strong className="text-[#154398]">{text || record.name}</Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem danh sách nhân viên">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenView(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa tên vị trí">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa vị trí">
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => {
                setDeleteId(record.positionID || record.id);
                setIsConfirmOpen(true);
              }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- CỘT BẢNG XEM NHÂN VIÊN ---
  const employeeColumns = [
    {
      title: "Tên nhân viên",
      key: "fullName",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div className="flex flex-col">
            <Text strong>{record.fullName}</Text>
            <Text type="secondary" className="text-[12px]">{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (phone) => (
        <span className="flex items-center gap-1">
          <PhoneOutlined className="text-gray-400" /> {phone || "Chưa cập nhật"}
        </span>
      )
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      render: (date) => date ? (
        <span className="flex items-center gap-1">
          <CalendarOutlined className="text-gray-400" /> {dayjs(date).format("DD/MM/YYYY")}
        </span>
      ) : "---"
    }
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <SolutionOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">Quản lý Vị trí</h1>
          </div>
          
          <Space>
            <Input
              placeholder="Tìm tên vị trí..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-64 h-10 rounded-xl shadow-sm border-none"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              className="h-10 bg-[#154398] rounded-xl font-bold border-none shadow-md"
              onClick={handleOpenCreate}
            >
              THÊM VỊ TRÍ
            </Button>
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            columns={columns}
            dataSource={data.filter(item =>
              (item.positionName || item.name || "").toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey={(record) => record.positionID || record.id}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* MODAL THÊM/SỬA */}
      <CustomModal
        open={isModalOpen}
        title={<span className="font-bold uppercase text-[#154398]">{isCreateMode ? "Thêm vị trí mới" : "Cập nhật tên vị trí"}</span>}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button key="submit" type="primary" className="bg-[#154398] border-none" onClick={() => form.submit()}>
            {isCreateMode ? "Tạo ngay" : "Lưu thay đổi"}
          </Button>
        ]}
        zIndex={2000}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
          <Form.Item 
            name="positionName" 
            label={<span className="font-bold">Tên vị trí / Chức danh</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
          >
            <Input placeholder="Ví dụ: Nhân viên Marketing, Trưởng phòng IT..." className="h-10 rounded-lg" />
          </Form.Item>
        </Form>
      </CustomModal>

      {/* MODAL XEM DANH SÁCH NHÂN VIÊN */}
      <CustomModal
        open={isViewModalOpen}
        title={<span className="font-bold uppercase text-[#154398]">Danh sách nhân sự vị trí {viewingPositionName}</span>}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" className="bg-[#154398]" onClick={() => setIsViewModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        zIndex={2000}
      >
        <div className="mt-4">
          <Table 
            columns={employeeColumns} 
            dataSource={employeesInPosition} 
            rowKey="employeeID"
            loading={loadingEmployees}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "Chưa có nhân viên nào đảm nhiệm vị trí này" }}
          />
        </div>
      </CustomModal>

      {/* MODAL XÁC NHẬN XÓA */}
      <CustomModal
        open={isConfirmOpen}
        title={<span className="text-red-600 font-bold uppercase">Xác nhận xóa vị trí</span>}
        onCancel={() => setIsConfirmOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsConfirmOpen(false)}>Hủy bỏ</Button>,
          <Button key="submit" type="primary" danger onClick={handleDelete}>Xác nhận xóa</Button>
        ]}
        zIndex={2000}
      >
        <div className="flex items-start gap-4 py-4 text-left">
          <ExclamationCircleOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
          <div className="flex flex-col gap-3">
            <Text className="text-base font-medium text-slate-800">
              Bạn có chắc chắn muốn xóa vị trí/chức danh này khỏi hệ thống?
            </Text>
            
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mt-1">
              <Text className="text-orange-700 text-[13px] leading-relaxed block">
                <span className="font-bold">⚠️ Lưu ý:</span> Hệ thống chỉ cho phép xóa khi vị trí này <strong>không còn nhân sự nào đảm nhiệm</strong>. Vui lòng thuyên chuyển hoặc cập nhật chức danh cho nhân viên trước khi thực hiện.
              </Text>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}