"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Avatar,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  App,
  Divider,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  SolutionOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  HomeOutlined,
  CalendarOutlined,
  ManOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import employeeService from "@/services/HRCore/employeeService";
import axiosClient from "@/lib/axiosClient";
import CustomModal from "@/components/Modal/CustomModal";

const { Text, Title } = Typography;

export default function EmployeeListPage() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  // States dữ liệu
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Dùng cho danh sách chọn Quản lý

  // UI States
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        employeeService.getAll({ PageNumber: 1, PageSize: 100 }),
        axiosClient.get("/Departments"),
        axiosClient.get("/Positions"),
      ]);

      const empList = empRes.data?.data || empRes.data || empRes || [];
      const deptList = deptRes.data || deptRes || [];
      const posList = posRes.data || posRes || [];

      setEmployees(empList);
      setFilteredEmployees(empList);
      setDepartments(deptList);
      setPositions(posList);
      setAllEmployees(empList);
    } catch (error) {
      notification.error({
        title: "Lỗi tải dữ liệu",
        description: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Logic lọc dữ liệu tương tự LaborContract
  useEffect(() => {
    const filtered = employees.filter((e) => {
      const matchName =
        !searchText ||
        e.fullName?.toLowerCase().includes(searchText.toLowerCase());
      const matchDept = !filterDept || e.department?.name === filterDept;
      return matchName && matchDept;
    });
    setFilteredEmployees(filtered);
  }, [searchText, filterDept, employees]);

  // Xử lý xem chi tiết
  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const detail = await employeeService.getById(record.employeeID);
      setSelectedEmployee(detail);
      setIsDetailModalOpen(true);
    } catch (err) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải chi tiết nhân viên.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở form sửa
  const handleEdit = (record) => {
    setEditingId(record.employeeID);
    setSelectedEmployee(record);
    setIsModalOpen(true);

    // Nạp dữ liệu vào form (delay nhẹ để modal kịp render)
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
        joinDate: record.joinDate ? dayjs(record.joinDate) : null,
        departmentID: record.department?.id,
        positionID: record.position?.id,
        managerID: record.manager?.id,
      });
    }, 100);
  };

  // Xử lý xóa (vô hiệu hóa)
  const handleDelete = (record) => {
    setSelectedEmployee(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await employeeService.delete(selectedEmployee.employeeID);
      notification.success({
        title: "Thành công",
        message: "Đã xóa nhân viên.",
      });
      setIsDeleteModalOpen(false);
      fetchInitialData();
    } catch (err) {
      notification.error({
        title: "Lỗi",
        description: err.response?.data?.message,
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
        joinDate: values.joinDate?.format("YYYY-MM-DD"),
      };

      await employeeService.update(editingId, payload);
      notification.success({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) {
      notification.error({
        title: "Cập nhật thông tin thất bại",
        description: error.response?.data?.message,
      });
    }
  };

  const disabledDate = (current) => {
    // Chặn tất cả các ngày sau ngày này (Ngày hiện tại - 15 năm)
    return current && current > dayjs().subtract(15, "year").endOf("day");
  };

  const columns = [
    {
      title: "Nhân viên",
      key: "name",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatarURL}
            icon={<UserOutlined />}
            className="bg-blue-100 text-blue-600"
          />
          <div className="flex flex-col">
            <Text strong>{record.fullName}</Text>
            <Text type="secondary" className="text-[12px]">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Phòng ban",
      key: "department",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Tag
          color="blue"
          className="border-none bg-blue-50 text-blue-600 font-medium px-3"
        >
          {record.department?.name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Vị trí",
      key: "position",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Tag color="cyan" className="font-medium">
          {record.position?.name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      width: 130,
      render: (status) => (
        <Tag
          color={status === "Working" ? "green" : "orange"}
          className="font-bold text-[9px] uppercase rounded-full"
        >
          {status === "Working" ? "Đang làm việc" : status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 text-left">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <TeamOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">
              Quản lý Nhân sự toàn công ty
            </h1>
          </div>

          <Space wrap size="small">
            <Input
              placeholder="Tìm tên nhân viên..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-64 h-10 rounded-xl border-none shadow-sm"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Select
              placeholder="Lọc phòng ban"
              allowClear
              className="w-56 h-10 shadow-sm"
              onChange={(val) => setFilterDept(val)}
              options={departments.map((d) => ({
                label: d.departmentName,
                value: d.departmentName,
              }))}
            />
          </Space>
        </div>

        {/* TABLE SECTION */}
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="employeeID"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (t) => (
                <Text type="secondary" className="text-xs">
                  Tổng cộng {t} nhân viên
                </Text>
              ),
            }}
          />
        </Card>
      </div>

      {/* MODAL CẬP NHẬT */}
      <CustomModal
        open={isModalOpen}
        title={
          <span className="text-[#154398] font-black uppercase flex items-center gap-2">
            <SolutionOutlined /> Cập nhật thông tin nhân viên
          </span>
        }
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => setIsModalOpen(false)}
            className="rounded-lg h-10 px-6"
          >
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            className="bg-[#154398] rounded-lg h-10 px-8 font-bold"
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={850}
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-4 text-left"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-bold">Họ và Tên</span>}
                name="fullName"
                rules={[{ required: true }]}
              >
                <Input prefix={<UserOutlined />} className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-bold">Email công việc</span>}
                name="email"
                rules={[{ type: "email" }]}
              >
                <Input prefix={<MailOutlined />} className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input prefix={<PhoneOutlined />} className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-bold">Ngày sinh</span>}
                name="dateOfBirth"
                validateTrigger={["onChange", "onBlur"]}
                rules={[
                  { message: "Vui lòng chọn ngày sinh" },
                  {
                    validator: (_, value) => {
                      if (value && dayjs().diff(value, "year") < 15) {
                        return Promise.reject(
                          new Error("Nhân viên phải từ 15 tuổi trở lên!"),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="w-full h-10 rounded-lg"
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate} 
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giới tính" name="gender">
                <Select
                  className="h-10"
                  options={[
                    { label: "Nam", value: "Male" },
                    { label: "Nữ", value: "Female" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Địa chỉ thường trú" name="address">
                <Input.TextArea rows={2} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>
          <Divider titlePlacement="left" className="m-0 mt-2">
            <Text
              type="secondary"
              className="text-[11px] uppercase font-bold text-[#154398]"
            >
              Công tác & Tổ chức
            </Text>
          </Divider>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Form.Item label="Phòng ban" name="departmentID">
                <Select placeholder="Chọn phòng ban" className="h-10">
                  {departments.map((d) => (
                    <Select.Option key={d.departmentID} value={d.departmentID}>
                      {d.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vị trí / Chức vụ" name="positionID">
                <Select placeholder="Chọn vị trí" className="h-10">
                  {positions.map((p) => (
                    <Select.Option key={p.positionID} value={p.positionID}>
                      {p.positionName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày đi làm" name="joinDate">
                <DatePicker
                  className="w-full h-10 rounded-lg"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái làm việc" name="status">
                <Select
                  className="h-10"
                  options={[
                    { label: "Đang làm việc", value: "Working" },
                    { label: "Nghỉ phép", value: "On Leave" },
                    { label: "Đã nghỉ việc", value: "Resigned" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* MODAL CHI TIẾT */}
      <CustomModal
        open={isDetailModalOpen}
        title={
          <span className="text-[#154398] font-black uppercase flex items-center gap-2">
            <EyeOutlined /> Thông tin chi tiết nhân viên
          </span>
        }
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
            className="bg-[#154398] px-8 rounded-lg h-10"
          >
            Đóng
          </Button>,
        ]}
        width={700}
        zIndex={2000}
      >
        {selectedEmployee && (
          <div className="py-4 text-left">
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Avatar
                size={70}
                src={selectedEmployee.avatarURL}
                icon={<UserOutlined />}
                className="bg-blue-600 border-4 border-white shadow-sm"
              />
              <div>
                <Title level={4} className="m-0 text-[#154398]">
                  {selectedEmployee.fullName}
                </Title>
                <Tag color="blue" className="mt-1">
                  {selectedEmployee.position?.name}
                </Tag>
                <Text type="secondary" className="block text-xs mt-1 italic">
                  ID Nhân viên: #EMP{selectedEmployee.employeeID}
                </Text>
              </div>
              <div className="ml-auto text-right">
                <Tag
                  color={
                    selectedEmployee.status === "Working" ? "green" : "orange"
                  }
                  className="rounded-full uppercase font-bold text-[10px]"
                >
                  {selectedEmployee.status}
                </Tag>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 px-2">
              <div>
                <Text
                  type="secondary"
                  className="block text-[10px] uppercase font-bold"
                >
                  Email
                </Text>
                <Text strong>{selectedEmployee.email}</Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className="block text-[10px] uppercase font-bold"
                >
                  Điện thoại
                </Text>
                <Text strong>{selectedEmployee.phone || "Chưa cập nhật"}</Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className="block text-[10px] uppercase font-bold"
                >
                  Phòng ban
                </Text>
                <Text strong>{selectedEmployee.department?.name}</Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className="block text-[10px] uppercase font-bold"
                >
                  Ngày vào làm
                </Text>
                <Text strong>
                  {dayjs(selectedEmployee.joinDate).format("DD/MM/YYYY")}
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className="block text-[10px] uppercase font-bold"
                >
                  Giới tính
                </Text>
                <Text strong>{selectedEmployee.gender}</Text>
              </div>
            </div>

            <div className="mt-4 px-2">
              <Text
                type="secondary"
                className="block text-[10px] uppercase font-bold"
              >
                Địa chỉ
              </Text>
              <Text>{selectedEmployee.address || "N/A"}</Text>
            </div>
          </div>
        )}
      </CustomModal>

      {/* MODAL XÁC NHẬN XÓA */}
      <CustomModal
        open={isDeleteModalOpen}
        title={
          <span className="text-red-600 font-bold uppercase">
            <DeleteOutlined /> Xác nhận xóa nhân sự
          </span>
        }
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="no" onClick={() => setIsDeleteModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="yes" danger type="primary" onClick={confirmDelete}>
            Đồng ý xóa
          </Button>,
        ]}
      >
        <Text>
          Bạn có chắc chắn muốn xóa nhân viên{" "}
          <Text strong>{selectedEmployee?.fullName}</Text> ra khỏi hệ thống
          không? Hành động này không thể hoàn tác.
        </Text>
      </CustomModal>
    </div>
  );
}
