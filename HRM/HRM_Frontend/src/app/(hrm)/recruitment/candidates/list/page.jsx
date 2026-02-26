"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  App,
  Input,
  Avatar,
  Tooltip,
  Select,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  FilePdfOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import axiosClient from "@/lib/axiosClient";
import { PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants/pageSizeOptions";
import CustomModal from "@/components/Modal/CustomModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  // State tìm kiếm
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDeptId, setFilterDeptId] = useState(null);

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidateRes, deptRes] = await Promise.all([
        candidateService.getAdminList(),
        axiosClient.get("/Departments"),
      ]);

      setCandidates(candidateRes);
      setFilteredCandidates(candidateRes);
      setDepartments(deptRes.data || deptRes);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải dữ liệu hệ thống.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý duyệt (Screening) hoặc loại (Reject) ứng viên
  const handleProcess = async (id, action) => {
    try {
      setLoading(true);
      await candidateService.processCandidate(id, action);

      notification.success({
        title: "Thành công",
        description:
          action === "accept"
            ? "Đã chuyển ứng viên sang trạng thái Screening."
            : "Đã loại ứng viên và gửi mail phản hồi.",
      });
      fetchData(); // Load lại dữ liệu để cập nhật bảng
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác này.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic lọc realtime
  useEffect(() => {
    const filtered = candidates.filter((item) => {
      return (
        (!searchName ||
          item.fullName?.toLowerCase().includes(searchName.toLowerCase())) &&
        (!searchEmail ||
          item.email?.toLowerCase().includes(searchEmail.toLowerCase())) &&
        (!searchPhone || item.phone?.includes(searchPhone)) &&
        (!filterDeptId || item.departmentID === filterDeptId)
      );
    });
    setFilteredCandidates(filtered);
  }, [searchName, searchEmail, searchPhone, filterDeptId, candidates]);
  // Hàm mở Modal loại
  const showRejectModal = (id) => {
    setSelectedCandidateId(id);
    setIsRejectModalOpen(true);
  };

  // Hàm đóng Modal
  const handleCancelReject = () => {
    setIsRejectModalOpen(false);
    setSelectedCandidateId(null);
  };

  // Hàm xác nhận loại (gọi từ Modal)
  const handleConfirmReject = () => {
    if (selectedCandidateId) {
      handleProcess(selectedCandidateId, "reject");
      setIsRejectModalOpen(false);
    }
  };
  const columns = [
    {
      title: <div className="text-center w-full">Thông tin ứng viên</div>,
      key: "info",
      width: "25%",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={42}
            className="bg-[#00aeef] flex-shrink-0"
            icon={<UserOutlined />}
          />
          <div className="flex flex-col overflow-hidden text-left">
            <Text strong className="text-[#154398] text-base truncate">
              {record.fullName}
            </Text>
            <div className="flex flex-col text-[12px] text-gray-500 mt-0.5">
              <span>
                <MailOutlined className="mr-2" />
                {record.email}
              </span>
              <span>
                <PhoneOutlined className="mr-2" />
                {record.phone || "N/A"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Vị trí ứng tuyển</div>,
      key: "job",
      render: (_, record) => (
        <div className="flex flex-col text-left">
          <Text className="text-gray-700 font-medium">{record.jobTitle}</Text>
          <Text className="text-[11px] text-[#00aeef] font-bold uppercase">
            Phòng: {record.departmentName}
          </Text>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Trạng thái</div>,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let label = status;
        if (status === "Applied") {
          color = "blue";
          label = "Mới nộp";
        }
        if (status === "Screening") {
          color = "cyan";
          label = "Đang lọc";
        }
        if (status === "Rejected") {
          color = "red";
          label = "Đã loại";
        }

        return (
          <Tag color={color} className="font-bold px-3 py-0.5 rounded-full">
            {label}
          </Tag>
        );
      },
    },
    {
      title: <div className="text-center w-full">Thời gian</div>,
      dataIndex: "createdAt",
      render: (date) => (
        <div className="flex flex-col text-left">
          <Text className="text-gray-700">
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
          <Text className="text-[11px] text-gray-400">
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Thao tác</div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết CV">
            <Button
              type="text"
              icon={<FilePdfOutlined className="text-red-500 text-xl" />}
              onClick={() =>
                window.open(`https://localhost:7167${record.cvUrl}`, "_blank")
              }
            />
          </Tooltip>

          {/* Chỉ hiện nút xử lý nếu là hồ sơ mới nộp */}
          {record.status === "Applied" && (
            <>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                className="rounded-md"
                onClick={() => showRejectModal(record.candidateID)}
              >
                Loại
              </Button>

              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                className="bg-green-500 hover:bg-green-600 border-none rounded-md"
                onClick={() => handleProcess(record.candidateID, "accept")}
              >
                Chọn
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <Title level={3} className="text-[#154398] font-black uppercase m-0">
          Tất cả hồ sơ Ứng viên
        </Title>

        <Card
          className="rounded-2xl shadow-sm border-none bg-white"
          styles={{ body: { padding: "12px 24px" } }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <Tag
              color="#154398"
              icon={<SearchOutlined />}
              className="px-4 py-1 rounded-lg text-sm border-none"
            >
              BỘ LỌC
            </Tag>
            <Input
              placeholder="Họ tên..."
              prefix={<UserOutlined className="text-gray-300" />}
              className="flex-1 min-w-[180px] rounded-lg"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
            />
            <Input
              placeholder="Email..."
              prefix={<MailOutlined className="text-gray-300" />}
              className="flex-1 min-w-[180px] rounded-lg"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              allowClear
            />
            <Input
              placeholder="Số điện thoại..."
              prefix={<PhoneOutlined className="text-gray-300" />}
              className="flex-1 min-w-[180px] rounded-lg"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              allowClear
            />

            <Select
              placeholder="Chọn phòng ban"
              className="flex-1 min-w-[180px]"
              allowClear
              onChange={(value) => setFilterDeptId(value)}
            >
              {departments.map((d) => (
                <Select.Option key={d.departmentID} value={d.departmentID}>
                  {d.departmentName}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-md border-none overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            loading={loading}
            rowKey="candidateID"
            pagination={{
              defaultPageSize: DEFAULT_PAGE_SIZE,
              pageSizeOptions: PAGE_SIZE,
              showSizeChanger: true,
              placement: "bottomCenter",
              showTotal: (total) => `Tổng số ${total}`,
            }}
          />
        </Card>
      </div>
      <CustomModal
        open={isRejectModalOpen}
        zIndex={2000}
        title={
          <span className="text-red-600 font-bold">Xác nhận loại ứng viên</span>
        }
        onCancel={handleCancelReject}
        footer={[
          <Button key="back" onClick={handleCancelReject}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            danger
            type="primary"
            loading={loading}
            onClick={handleConfirmReject}
          >
            Đồng ý loại
          </Button>,
        ]}
      >
        <div className="py-4">
          <Text>
            Bạn có chắc chắn muốn loại ứng viên này?
            <br />
            <span className="text-gray-500 text-sm">
              * Hệ thống sẽ tự động gửi email thông báo từ chối đến ứng viên
              ngay sau khi xác nhận.
            </span>
          </Text>
        </div>
      </CustomModal>
    </div>
  );
}
