"use client";

import React, { useEffect, useState } from "react";
import {
  Table, Button, Space, Card, Typography, Avatar, Tag, Form, Input, Row, Col, App, Tooltip, Select,
} from "antd";
import {
  HomeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined,
  PhoneOutlined, UserOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";
import departmentService from "@/services/Department/departmentService";
import CustomModal from "@/components/Modal/CustomModal";

const { Text } = Typography;

export default function DepartmentManagementPage() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptEmployees, setDeptEmployees] = useState([]); 
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getAll({ pageNumber: 1, pageSize: 100 });
      setData(res?.data || res || []);
    } catch (error) {
      notification.error({ message: "Lỗi", description: "Không thể tải danh sách phòng ban" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchEmployeesByDept = async (deptId) => {
    setIsLoadingEmployees(true);
    try {
      const res = await departmentService.getEmployeesByDept(deptId);
      console.log("Employees in Dept:", res.data);
      setDeptEmployees(res?.data || []);
    } catch (error) {
      notification.error({ message: "Lỗi", description: "Không thể lấy danh sách nhân viên của phòng này" });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setSelectedId(null);
    setDeptEmployees([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (record) => {
    setIsCreateMode(false);
    setSelectedId(record.departmentID);
    setIsModalOpen(true);
    
    setDeptEmployees([]);
    await fetchEmployeesByDept(record.departmentID);

    form.setFieldsValue({
      departmentName: record.departmentName,
      phone: record.phone,
      managerID: record.manager?.id, 
    });
  };

  const onFinish = async (values) => {
    try {
      if (isCreateMode) {
        await departmentService.create(values);
        notification.success({ message: "Thành công", description: "Đã tạo phòng ban mới." });
      } else {
        await departmentService.update(selectedId, values);
        notification.success({ message: "Thành công", description: "Cập nhật thông tin thành công." });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại dữ liệu.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(deleteId);
      notification.success({ message: "Thành công", description: "Đã xóa phòng ban." });
      setIsConfirmOpen(false);
      fetchData();
    } catch (error) {
      notification.error({
        message: "Lỗi xóa phòng ban",
        description: error.response?.data?.message || "Hành động không hợp lệ.",
      });
    }
  };

  const columns = [
    {
      title: "Tên phòng ban",
      dataIndex: "departmentName",
      render: (text) => (
        <Space>
          <Avatar icon={<HomeOutlined />} className="bg-[#154398]" />
          <Text strong className="text-[#154398]">{text}</Text>
        </Space>
      ),
    },
    {
      title: "Trưởng phòng",
      dataIndex: "manager",
      render: (manager) => manager ? (
        <Tag icon={<UserOutlined />} color="cyan" className="rounded-md font-medium">
          {manager.name}
        </Tag>
      ) : <Text type="secondary" italic>Chưa bổ nhiệm</Text>
    },
    {
      title: "Số nội bộ",
      dataIndex: "phone",
      render: (phone) => phone || "---"
    },
    {
      title: "Thao tác",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa phòng ban">
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => {
                setDeleteId(record.departmentID);
                setIsConfirmOpen(true);
              }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <HomeOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">Quản lý Phòng ban</h1>
          </div>
          
          <Space>
            <Input
              placeholder="Tìm tên phòng ban..."
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
              THÊM PHÒNG BAN
            </Button>
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            columns={columns}
            dataSource={data.filter(item =>
              (item.departmentName || "").toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="departmentID"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* MODAL THÊM/SỬA */}
      <CustomModal
        open={isModalOpen}
        title={<span className="font-bold uppercase text-[#154398]">{isCreateMode ? "Thêm phòng ban mới" : "Cập nhật phòng ban"}</span>}
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="departmentName" 
                label={<span className="font-bold">Tên phòng ban</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
              >
                <Input placeholder="Ví dụ: Phòng Marketing" className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={<span className="font-bold">Số điện thoại</span>}>
                <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 024.xxx" className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="managerID" 
                label={<span className="font-bold">Trưởng phòng</span>}
                tooltip="Chỉ có thể bổ nhiệm nhân viên đang thuộc phòng ban này"
              >
                <Select 
                  placeholder={isCreateMode ? "Tạo phòng trước" : "Chọn nhân viên quản lý"} 
                  className="h-10 w-full"
                  disabled={isCreateMode} 
                  loading={isLoadingEmployees}
                  allowClear
                >
                  {deptEmployees.map((emp) => (
                    <Select.Option key={emp.id} value={emp.id}>{emp.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* MODAL XÁC NHẬN XÓA */}
      <CustomModal
        open={isConfirmOpen}
        title={<span className="text-red-600 font-bold uppercase">Xác nhận xóa phòng ban</span>}
        onCancel={() => setIsConfirmOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsConfirmOpen(false)}>Hủy bỏ</Button>,
          <Button key="submit" type="primary" danger onClick={handleDelete}>Xác nhận xóa</Button>
        ]}
        zIndex={2000}
      >
        <div className="flex items-start gap-4 py-4 text-left">
          <ExclamationCircleOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
          <div>
            <Text>Bạn có chắc chắn muốn xóa phòng ban này?</Text> <br />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}