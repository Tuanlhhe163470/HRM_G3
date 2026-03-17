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
  Input,
  App,
  Tooltip,
  Row,
  Col,
  Divider,
  Form,
  DatePicker,
  Select,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  TeamOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  SolutionOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import employeeService from "@/services/HRCore/employeeService";
import CustomModal from "@/components/Modal/CustomModal";
import axiosClient from "@/lib/axiosClient";

const { Text, Title } = Typography;

export default function DepartmentEmployeePage() {
  const { notification } = App.useApp();

  // States dữ liệu
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Pagination States
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // UI States
  const [searchText, setSearchText] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const initData = async () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setManagerInfo(user);
        if (user.departmentID) {
          fetchDepartmentData(user.departmentID, 1, 10);
        }
      }
      // Gọi fetch positions ngay lập tức
      await fetchPositions();
    };
    initData();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await axiosClient.get("/Positions");
      setPositions(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách vị trí:", error);
      setPositions([]);
    }
  };

  const fetchDepartmentData = async (deptId, page, size) => {
    setLoading(true);
    try {
      const res = await employeeService.getByDepartment(deptId, {
        PageNumber: page,
        PageSize: size,
      });

      const dataList = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
          ? res.data
          : [];

      const total = res.totalRecords;

      setEmployees(dataList);
      setFilteredEmployees(dataList);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: total,
      }));
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      notification.error({
        title: "Lỗi tải dữ liệu",
        description: "Không thể lấy danh sách nhân viên.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm nhanh trên danh sách hiện tại
  useEffect(() => {
    const filtered = (employees || []).filter((e) => {
      const matchName =
        !searchText ||
        e.fullName?.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = !filterStatus || e.status === filterStatus;

      return matchName && matchStatus;
    });

    setFilteredEmployees(filtered);
  }, [searchText, filterStatus, employees]);

  const handleTableChange = (newPagination) => {
    const deptId = managerInfo?.departmentID;
    if (deptId) {
      fetchDepartmentData(
        deptId,
        newPagination.current,
        newPagination.pageSize,
      );
    }
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await employeeService.getById(record.employeeID);
      setSelectedEmployee(res.data || res);
      setIsDetailModalOpen(true);
    } catch (err) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải chi tiết hồ sơ.",
      });
    } finally {
      setLoading(false);
    }
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
            className="bg-[#154398]"
          />
          <div className="flex flex-col text-left">
            <Text strong>{record.fullName}</Text>
            <Text type="secondary" className="text-[12px]">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vị trí",
      key: "position",
      align: "center",
      render: (_, record) => (
        <Tag color="cyan" className="font-medium px-3 border-none">
          {record.position?.name || record.positionName || "Thành viên"}
        </Tag>
      ),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      align: "center",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              icon={<EyeOutlined className="text-[#154398] text-lg" />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <TeamOutlined style={{ fontSize: "24px" }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#154398] uppercase m-0">
                Nhân sự phòng ban
              </h1>
              <Text type="secondary">
                Bộ phận:{" "}
                <Text strong className="text-[#154398]">
                  {managerInfo?.departmentName}
                </Text>
              </Text>
            </div>
          </div>

          <Space wrap>
            <Input
              placeholder="Tìm theo tên nhân viên..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-72 h-10 rounded-xl border-none shadow-sm"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Select
              placeholder="Lọc trạng thái"
              allowClear
              className="w-52 h-10 shadow-sm"
              onChange={(val) => setFilterStatus(val)}
              options={[
                { label: "Đang làm việc", value: "Working" },
                { label: "Nghỉ phép", value: "On Leave" },
                { label: "Đã nghỉ việc", value: "Resigned" },
              ]}
            />
          </Space>
        </div>

        {/* TABLE SECTION */}
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0 text-left">
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="employeeID"
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (t) => (
                <Text type="secondary" className="text-xs">
                  Tổng số {t} nhân sự
                </Text>
              ),
            }}
            onChange={handleTableChange}
          />
        </Card>
      </div>

      {/* MODAL CHI TIẾT */}
      <CustomModal
        open={isDetailModalOpen}
        title={
          <span className="text-[#154398] font-black uppercase flex items-center gap-2">
            <SolutionOutlined /> Chi tiết hồ sơ nhân sự
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
            <div className="flex items-center gap-4 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
              <Avatar
                size={80}
                src={selectedEmployee.avatarURL}
                icon={<UserOutlined />}
                className="bg-[#154398] border-4 border-white shadow-md"
              />
              <div>
                <Title level={4} className="m-0 text-[#154398]">
                  {selectedEmployee.fullName}
                </Title>
                <Tag color="blue" className="mt-1 font-medium">
                  {selectedEmployee.position?.name ||
                    selectedEmployee.positionName}
                </Tag>
                <div className="flex gap-4 mt-2">
                  <Text className="text-xs text-slate-500">
                    <MailOutlined /> {selectedEmployee.email}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    <PhoneOutlined /> {selectedEmployee.phone || "---"}
                  </Text>
                </div>
              </div>
            </div>

            <Row gutter={[32, 24]} className="px-2">
              <Col span={12}>
                <Space orientation="vertical" size={0}>
                  <Text
                    type="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    Ngày sinh
                  </Text>
                  <Text strong>
                    {selectedEmployee.dateOfBirth
                      ? dayjs(selectedEmployee.dateOfBirth).format("DD/MM/YYYY")
                      : "---"}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space orientation="vertical" size={0}>
                  <Text
                    type="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    Giới tính
                  </Text>
                  <Text strong>{selectedEmployee.gender || "---"}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space orientation="vertical" size={0}>
                  <Text
                    type="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    Ngày gia nhập
                  </Text>
                  <Text strong>
                    {dayjs(selectedEmployee.joinDate).format("DD/MM/YYYY")}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space orientation="vertical" size={0}>
                  <Text
                    type="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    Trạng thái hiện tại
                  </Text>
                  <Tag
                    color="green"
                    className="m-0 uppercase text-[10px] font-bold"
                  >
                    {selectedEmployee.status}
                  </Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Divider className="my-2" />
                <Space orientation="vertical" size={0}>
                  <Text
                    type="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    Địa chỉ liên hệ
                  </Text>
                  <Text>
                    {selectedEmployee.address || "Chưa cập nhật địa chỉ"}
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </CustomModal>
    </div>
  );
}
