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
  Row,
  Col,
  App,
  Tooltip,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  TeamOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import accountService from "@/services/Account/accountService";
import CustomModal from "@/components/Modal/CustomModal";
import axiosClient from "@/lib/axiosClient";

const { Text, Title } = Typography;

export default function AccountManagementPage() {
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  // Data States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // UI States
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState(null); // State lọc theo Role
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modal Xác nhận
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    content: "",
    type: "",
    onOk: () => {},
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setCurrentAdmin(JSON.parse(userStr));

      const [accRes, empWithoutRes, roleRes] = await Promise.all([
        accountService.getAllAccounts(),
        accountService.getEmployeesWithoutAccount(),
        accountService.getRoles(),
      ]);

      const activeAccounts = accRes?.data || accRes || [];
      const withoutAccountEmps = empWithoutRes?.data || empWithoutRes || [];
      const rolesData = roleRes?.data || roleRes || [];
      setRoles(rolesData);

      const mappedAccounts = activeAccounts.map((acc) => ({
        key: `acc-${acc.accountID}`,
        employeeID: acc.employeeID,
        accountID: acc.accountID,
        fullName: acc.employeeName || "N/A",
        username: acc.username,
        roleName: acc.roleName,
        isActive: acc.isActive,
        hasAccount: true,
      }));

      const mappedWithout = withoutAccountEmps.map((emp) => ({
        key: `emp-${emp.employeeID}`,
        employeeID: emp.employeeID,
        fullName: emp.fullName,
        username: null,
        roleName: null,
        isActive: false,
        hasAccount: false,
      }));

      const combined = [...mappedAccounts, ...mappedWithout].sort(
        (a, b) => b.employeeID - a.employeeID,
      );
      setData(combined);
    } catch (error) {
      notification.error({ title: "Lỗi kết nối API" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC XỬ LÝ ACTIONS ---

  const handleResetPassword = (record) => {
    setConfirmConfig({
      title: "XÁC NHẬN ĐẶT LẠI MẬT KHẨU",
      content: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${record.username}" về mặc định (123456)?`,
      type: "warning",
      onOk: async () => {
        try {
          if (!record.accountID) {
            notification.error({
              title: "Lỗi",
              description: "ID tài khoản không hợp lệ!",
            });
            return;
          }

          await accountService.changePassword(record.accountID, "123456");
          notification.success({
            title: "Thành công",
            description: "Mật khẩu đã về 123456",
          });
          setIsConfirmOpen(false);
        } catch (error) {
          notification.error({
            title: "Lỗi reset mật khẩu",
            description: error.response?.data?.message,
          });
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const handleToggleStatus = (record) => {
    const actionText = record.isActive ? "KHÓA" : "MỞ KHÓA";
    setConfirmConfig({
      title: `XÁC NHẬN ${actionText} TÀI KHOẢN`,
      content: `Hành động này sẽ làm tài khoản "${record.username}" ${record.isActive ? "không thể" : "có thể"} truy cập hệ thống. Tiếp tục?`,
      type: "info",
      onOk: async () => {
        try {
          await accountService.toggleStatus(record.accountID);
          notification.success({
            title: "Thành công",
            description: `Đã ${actionText.toLowerCase()} tài khoản.`,
          });
          fetchData();
          setIsConfirmOpen(false);
        } catch (error) {
          notification.error({
            title: "Lỗi",
            description: error.response?.data?.message,
          });
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = (record) => {
    setConfirmConfig({
      title: "XÓA TÀI KHOẢN VĨNH VIỄN",
      content: `Bạn đang thực hiện xóa tài khoản "${record.username}". Nhân viên sẽ mất quyền truy cập hệ thống.`,
      type: "danger",
      onOk: async () => {
        try {
          await accountService.deleteAccount(record.accountID);
          notification.success({ title: "Đã xóa tài khoản" });
          fetchData();
          setIsConfirmOpen(false);
        } catch (error) {
          notification.error({
            title: "Lỗi",
            description: error.response?.data?.message,
          });
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (isCreateMode) {
        await accountService.createAccount(values);
        notification.success({
          title: "Thành công",
          description: "Đã cấp tài khoản mới.",
        });
      } else {
        // KIỂM TRA BIẾN selectedRecord
        if (!selectedRecord || !selectedRecord.accountID) {
          notification.error({
            title: "Lỗi",
            description: "Không xác định được ID tài khoản cần cập nhật!",
          });
          return;
        }

        const payload = { roleID: values.roleID };

        // SỬA TẠI ĐÂY: Sử dụng accountID từ selectedRecord đã được gán khi nhấn nút Sửa
        await axiosClient.put(`/Accounts/${selectedRecord.accountID}`, payload);

        notification.success({
          title: "Thành công",
          description: "Đã cập nhật vai trò.",
        });
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchData(); // Load lại bảng
    } catch (error) {
      console.error("Update Error:", error);
      notification.error({
        title: "Thất bại",
        description:
          error.response?.data?.message || "Có lỗi xảy ra khi cập nhật",
      });
    }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: "Nhân viên",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            className={record.hasAccount ? "bg-[#154398]" : "bg-gray-300"}
          />
          <Text strong>{record.fullName}</Text>
        </Space>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (text) =>
        text ? (
          <Tag color="blue" className="font-medium">
            {text}
          </Tag>
        ) : (
          <Text type="secondary" italic>
            Chưa cấp
          </Text>
        ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "roleName",
      render: (role) => (role ? <Tag color="purple">{role}</Tag> : "---"),
    },
    {
      title: "Trạng thái",
      render: (_, record) =>
        record.hasAccount ? (
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Hoạt động" : "Đã khóa"}
          </Tag>
        ) : (
          <Badge status="default" text="Chưa cấp" />
        ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: 220,
      render: (_, record) => {
        if (!record.hasAccount) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => {
                setIsCreateMode(true);
                setSelectedRecord(record);
                setIsModalOpen(true);
                form.setFieldsValue({
                  employeeID: record.employeeID,
                  fullName: record.fullName,
                  password: "123456",
                });
              }}
              className="bg-green-600 border-none rounded-md"
            >
              Cấp tài khoản
            </Button>
          );
        }

        const isSelf = record.accountID === currentAdmin?.accountID;
        const isAdmin = record.roleName === "Admin";

        return (
          <Space>
            {/* Nút Sửa vai trò: Ẩn nếu là Admin */}
            {!isAdmin && (
              <Tooltip title="Sửa vai trò">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsCreateMode(false);
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                    const rID = roles.find(
                      (r) => r.roleName === record.roleName,
                    )?.roleID;
                    form.setFieldsValue({
                      fullName: record.fullName,
                      username: record.username,
                      roleID: rID,
                    });
                  }}
                />
              </Tooltip>
            )}

            {/* Nút Reset mật khẩu: Luôn hiển thị cho tất cả (kể cả Admin) */}
            <Tooltip title="Reset mật khẩu">
              <Button
                size="small"
                icon={<ReloadOutlined className="text-orange-500" />}
                onClick={() => handleResetPassword(record)}
              />
            </Tooltip>

            {/* Nút Khóa/Mở khóa: Ẩn nếu là Admin */}
            {!isAdmin && (
              <Tooltip title={record.isActive ? "Khóa" : "Mở"}>
                <Button
                  size="small"
                  danger={record.isActive}
                  icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                  disabled={isSelf}
                  onClick={() => handleToggleStatus(record)}
                />
              </Tooltip>
            )}

            {/* Nút Xóa: Ẩn nếu là Admin */}
            {!isAdmin && (
              <Tooltip title="Xóa">
                <Button
                  size="small"
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={isSelf}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // --- FILTER LOGIC ---
  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.fullName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (item.username &&
        item.username.toLowerCase().includes(searchText.toLowerCase()));

    const matchesRole = !filterRole || item.roleName === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <TeamOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0 whitespace-nowrap">
              Quản lý Tài khoản
            </h1>
          </div>

          <Space wrap className="flex-shrink-0">
            {/* Lọc theo Role */}
            <Select
              placeholder="Lọc theo quyền hạn"
              prefix={<FilterOutlined />}
              className="w-48 h-10 shadow-sm"
              allowClear
              onChange={(value) => setFilterRole(value)}
              options={roles.map((r) => ({
                label: r.roleName,
                value: r.roleName,
              }))}
            />
            {/* Tìm kiếm */}
            <Input
              placeholder="Tìm nhân viên / username..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-64 h-10 rounded-xl border-none shadow-sm"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record.key}
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng cộng ${total} tài khoản`,
            }}
          />
        </Card>
      </div>

      {/* MODAL THÊM / SỬA */}
      <CustomModal
        open={isModalOpen}
        title={
          <span className="font-bold uppercase text-[#154398]">
            {isCreateMode ? "Cấp tài khoản mới" : "Cập nhật tài khoản"}
          </span>
        }
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-[#154398]"
            onClick={() => form.submit()}
          >
            {isCreateMode ? "Tạo tài khoản" : "Lưu thay đổi"}
          </Button>,
        ]}
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-4 text-left"
        >
          <Form.Item name="employeeID" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Nhân viên" name="fullName">
                <Input disabled className="bg-gray-50 h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  disabled={!isCreateMode}
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleID"
                label="Quyền hạn"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn vai trò" className="h-10 w-full">
                  {roles.map((r) => (
                    <Select.Option key={r.roleID} value={r.roleID}>
                      {r.roleName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {isCreateMode && (
              <Col span={24}>
                <Form.Item name="password" label="Mật khẩu mặc định">
                  <Input.Password className="h-10 rounded-lg" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </CustomModal>

      {/* MODAL XÁC NHẬN CHUNG */}
      <CustomModal
        open={isConfirmOpen}
        title={
          <span
            className={`font-bold uppercase ${confirmConfig.type === "danger" ? "text-red-600" : "text-orange-500"}`}
          >
            {confirmConfig.title}
          </span>
        }
        onCancel={() => setIsConfirmOpen(false)}
        zIndex={2000}
        footer={[
          <Button key="back" onClick={() => setIsConfirmOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={confirmConfig.type === "danger"}
            onClick={confirmConfig.onOk}
            className={
              confirmConfig.type === "warning"
                ? "bg-orange-500 border-none"
                : ""
            }
          >
            Xác nhận
          </Button>,
        ]}
      >
        <div className="flex items-start gap-4 py-4">
          <ExclamationCircleOutlined
            style={{
              fontSize: "24px",
              color: confirmConfig.type === "danger" ? "#ff4d4f" : "#faad14",
            }}
          />
          <Text>{confirmConfig.content}</Text>
        </div>
      </CustomModal>
    </div>
  );
}
