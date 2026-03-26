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
import employeeService from "@/services/HRCore/employeeService";
import CustomModal from "@/components/Modal/CustomModal";

const { Text } = Typography;

export default function DepartmentManagementPage() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [managerCandidates, setManagerCandidates] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  // State mới: Nhận diện phòng ban trống để đổi câu thông báo cho HR
  const [isEmptyDept, setIsEmptyDept] = useState(false);
  
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
      notification.error({ title: "Lỗi", description: "Không thể tải danh sách phòng ban" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = async () => {
    setIsCreateMode(true);
    setSelectedId(null);
    setIsEmptyDept(true); // Form tạo mới mặc định là cho phép chọn tất cả
    form.resetFields();
    setIsModalOpen(true);

    setIsLoadingEmployees(true);
    try {
      const res = await employeeService.getAll({ PageNumber: 1, PageSize: 1000 });
      const empList = res?.data?.data || res?.data || res || []; 
      setManagerCandidates(empList);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể lấy danh sách nhân sự" });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleOpenEdit = async (record) => {
    setIsCreateMode(false);
    setSelectedId(record.departmentID);
    
    form.setFieldsValue({
      departmentName: record.departmentName,
      phone: record.phone,
      managerID: record.manager?.id || record.managerID, 
    });
    
    setIsModalOpen(true);

    setIsLoadingEmployees(true);
    try {
      // 1. Thử lấy nhân viên của phòng ban này trước
      let res = await employeeService.getByDepartment(record.departmentID, { PageNumber: 1, PageSize: 1000 });
      let empList = res?.data?.data || res?.data || res || [];
      
      // 2. FALLBACK LOGIC: Nếu phòng chưa có nhân viên nào, tự động lấy toàn bộ công ty
      if (empList.length === 0) {
        setIsEmptyDept(true);
        const allRes = await employeeService.getAll({ PageNumber: 1, PageSize: 1000 });
        empList = allRes?.data?.data || allRes?.data || allRes || [];
      } else {
        setIsEmptyDept(false);
      }

      setManagerCandidates(empList);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể tải nhân sự của phòng ban này" });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const onFinish = async (values) => {
    try {
      if (isCreateMode) {
        await departmentService.create(values);
        notification.success({ title: "Thành công", description: "Đã tạo phòng ban mới." });
      } else {
        await departmentService.update(selectedId, values);
        notification.success({ title: "Thành công", description: "Cập nhật thông tin thành công." });
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

  const handleDelete = async () => {
    try {
      await departmentService.delete(deleteId);
      notification.success({ title: "Thành công", description: "Đã xóa phòng ban." });
      setIsConfirmOpen(false);
      fetchData();
    } catch (error) {
      setIsConfirmOpen(false); 
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || (typeof errorData === 'string' ? errorData : "Phòng ban này không thể xóa lúc này.");

      notification.warning({
        title: "Không thể thực hiện",
        description: errorMessage,
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
                tooltip={
                  isCreateMode 
                    ? "Bạn có thể chọn bất kỳ nhân viên nào" 
                    : isEmptyDept 
                      ? "Phòng ban trống: Cho phép chọn từ toàn bộ công ty" 
                      : "Chỉ hiển thị nhân viên đang thuộc phòng ban này"
                }
              >
                <Select 
                  placeholder="Chọn nhân viên quản lý" 
                  className="h-10 w-full"
                  loading={isLoadingEmployees}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {managerCandidates.map((emp) => {
                    const id = emp.employeeID;
                    const name = emp.fullName;
                    return (
                      <Select.Option key={id} value={id}>
                        {name} 
                      </Select.Option>
                    );
                  })}
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
          <div className="flex flex-col gap-3">
            <Text className="text-base font-medium text-slate-800">
              Bạn có chắc chắn muốn xóa phòng ban này khỏi hệ thống?
            </Text>
            
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mt-1">
              <Text className="text-orange-700 text-[13px] leading-relaxed block">
                <span className="font-bold">⚠️ Lưu ý:</span> Hệ thống chỉ cho phép xóa khi phòng ban <strong>không còn nhân sự nào</strong>. Vui lòng đảm bảo đã thuyên chuyển toàn bộ nhân viên trước khi thực hiện.
              </Text>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}