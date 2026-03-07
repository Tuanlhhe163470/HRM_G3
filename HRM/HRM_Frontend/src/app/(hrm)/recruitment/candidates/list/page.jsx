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
  Tabs,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import axiosClient from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Modal/CustomModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [interviews, setInterviews] = useState([]); // Thêm state lưu danh sách phỏng vấn
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // States bộ lọc
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDeptId, setFilterDeptId] = useState(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidateRes, deptRes, interviewRes] = await Promise.all([
        candidateService.getAdminList(),
        axiosClient.get("/Departments"),
        candidateService.getAllInterviews(), // Lấy danh sách phỏng vấn để kiểm tra trạng thái
      ]);
      setCandidates(candidateRes);
      setFilteredCandidates(candidateRes);
      setDepartments(deptRes.data || deptRes);
      setInterviews(interviewRes || []); // Lưu danh sách lịch hẹn
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải dữ liệu.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = candidates.filter((item) => {
      const matchTab = activeTab === "ALL" || item.status === activeTab;
      const matchName =
        !searchName ||
        item.fullName?.toLowerCase().includes(searchName.toLowerCase());
      const matchEmail =
        !searchEmail ||
        item.email?.toLowerCase().includes(searchEmail.toLowerCase());
      const matchPhone = !searchPhone || item.phone?.includes(searchPhone);
      const matchDept = !filterDeptId || item.departmentID === filterDeptId;

      return matchTab && matchName && matchEmail && matchPhone && matchDept;
    });
    setFilteredCandidates(filtered);
  }, [
    searchName,
    searchEmail,
    searchPhone,
    filterDeptId,
    activeTab,
    candidates,
  ]);

  const handleProcess = async (id, action) => {
    setLoading(true);
    try {
      await candidateService.processCandidate(id, action);
      notification.success({
        title: "Thành công",
        description:
          action === "accept"
            ? "Đã chuyển ứng viên sang Screening."
            : action === "send_to_manager"
              ? "Đã gửi hồ sơ cho Manager."
              : "Đã cập nhật trạng thái.",
      });
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Thao tác thất bại." });
    } finally {
      setLoading(false);
    }
  };
  const handleSendFailEmail = async (id) => {
    setLoading(true);
    try {
      // Gọi đến API mới vừa tạo ở Backend
      await axiosClient.post(`/Candidates/${id}/send-fail-email`);

      notification.success({
        title: "Thành công",
        description: "Đã gửi email thông báo trượt phỏng vấn cho ứng viên.",
      });

      // Tải lại dữ liệu để cập nhật trạng thái nút (isFailEmailSent)
      fetchData();
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: error.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: <div className="text-center w-full">Thông tin ứng viên</div>,
      key: "info",
      width: "25%",
      render: (_, record) => (
        <div className="flex items-center gap-3 text-left">
          <Avatar size={42} className="bg-[#00aeef]" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <Text strong className="text-[#154398]">
              {record.fullName}
            </Text>
            <Text type="secondary" className="text-[12px]">
              <MailOutlined className="mr-1" />
              {record.email}
            </Text>
            <Text type="secondary" className="text-[12px]">
              <PhoneOutlined className="mr-1" />
              {record.phone || "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Vị trí & Phòng</div>,
      key: "job",
      render: (_, record) => (
        <div className="text-left">
          <Text className="font-medium text-gray-700">{record.jobTitle}</Text>
          <br />
          <Tag color="blue" className="mt-1">
            Phòng: {record.departmentName}
          </Tag>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Trạng thái</div>,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const statusMap = {
          Applied: { color: "blue", label: "Mới nộp" },
          Screening: { color: "cyan", label: "Đang lọc" },
          Manager_Review: { color: "orange", label: "Sếp duyệt" },
          Interview: { color: "purple", label: "Phỏng vấn" },
          Passed: { color: "#a0d911", label: "Đạt PV" },
          Fail: { color: "red", label: "Trượt PV" },
          Offered: { color: "#faad14", label: "Offer" },
          Hired: { color: "green", label: "Hired" },
          Rejected: { color: "red", label: "Loại" },
        };
        const config = statusMap[status] || { color: "default", label: status };
        return (
          <Tag
            color={config.color}
            className="font-bold rounded-full uppercase text-[10px] min-w-[85px] text-center"
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: <div className="text-center w-full">Thao tác</div>,
      key: "action",
      align: "center",
      render: (_, record) => {
        // Kiểm tra ứng viên đã có lịch hẹn trong bảng Interviews chưa
        const isScheduled = interviews.some(
          (inv) => inv.candidateID === record.candidateID,
        );

        return (
          <Space size="small">
            <Tooltip title="Xem CV">
              <Button
                type="text"
                icon={<FilePdfOutlined className="text-red-500 text-xl" />}
                onClick={() =>
                  window.open(`https://localhost:7167${record.cvUrl}`, "_blank")
                }
              />
            </Tooltip>

            {record.status === "Applied" && (
              <>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setSelectedCandidateId(record.candidateID);
                    setIsRejectModalOpen(true);
                  }}
                >
                  Loại
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  className="bg-green-500 border-none"
                  onClick={() => handleProcess(record.candidateID, "accept")}
                >
                  Chọn
                </Button>
              </>
            )}

            {record.status === "Screening" && (
              <>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setSelectedCandidateId(record.candidateID);
                    setIsRejectModalOpen(true);
                  }}
                >
                  Loại
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  className="bg-[#154398] border-none"
                  onClick={() =>
                    handleProcess(record.candidateID, "send_to_manager")
                  }
                >
                  Gửi Manager
                </Button>
              </>
            )}

            {record.status === "Interview" && (
              <Button
                type="primary"
                size="small"
                // Đổi icon và màu sắc nếu đã có lịch hẹn
                icon={isScheduled ? <EyeOutlined /> : <CalendarOutlined />}
                className={
                  isScheduled
                    ? "bg-emerald-600 hover:bg-emerald-700 border-none"
                    : "bg-purple-600 hover:bg-purple-700 border-none"
                }
                onClick={() => {
                  router.push(
                    `/recruitment/interview/hr-schedule?candidateId=${record.candidateID}`,
                  );
                }}
              >
                {/* Đổi text nút bấm dựa trên trạng thái lịch hẹn */}
                {isScheduled ? "Xem lịch phỏng vấn" : "Hẹn phỏng vấn"}
              </Button>
            )}

            {record.status === "Fail" && (
              <Button
                type="primary"
                size="small"
                danger
                icon={<SendOutlined />}
                loading={loading}
                disabled={record.isFailEmailSent}
                className={
                  record.isFailEmailSent
                    ? "bg-gray-300 border-none text-gray-500"
                    : "bg-red-500 border-none"
                }
                onClick={() => handleSendFailEmail(record.candidateID)}
              >
                {record.isFailEmailSent ? "Đã gửi email" : "Gửi mail trượt"}
              </Button>
            )}

            {record.status === "Passed" && (
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                className="bg-amber-500 hover:bg-amber-600 border-none rounded-lg"
                onClick={() => {
                  router.push(
                    `/recruitment/offer/create?candidateId=${record.candidateID}`,
                  );
                }}
              >
                Tạo Offer
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
        <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">
          DANH SÁCH ỨNG VIÊN
        </h1>

        {/* BỘ LỌC */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-3 bg-[#fcfcfc] border-b border-gray-100">
            <Tabs
              activeKey={activeTab}
              size="small"
              onChange={(key) => setActiveTab(key)}
              tabBarStyle={{ marginBottom: 0, borderBottom: "none" }}
              items={[
                {
                  key: "ALL",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px]">
                      Tất cả ({candidates.length})
                    </span>
                  ),
                },
                {
                  key: "Applied",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-blue-600">
                      Mới (
                      {candidates.filter((c) => c.status === "Applied").length})
                    </span>
                  ),
                },
                {
                  key: "Screening",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-cyan-600">
                      Đang lọc (
                      {
                        candidates.filter((c) => c.status === "Screening")
                          .length
                      }
                      )
                    </span>
                  ),
                },
                {
                  key: "Manager_Review",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-orange-600">
                      Chờ duyệt (
                      {
                        candidates.filter((c) => c.status === "Manager_Review")
                          .length
                      }
                      )
                    </span>
                  ),
                },
                {
                  key: "Interview",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-purple-600">
                      PHỎNG VẤN (
                      {
                        candidates.filter((c) => c.status === "Interview")
                          .length
                      }
                      )
                    </span>
                  ),
                },
                {
                  key: "Passed",
                  label: (
                    <span
                      className="px-2 font-bold uppercase text-[12px]"
                      style={{ color: "#a0d911" }}
                    >
                      Đạt PV (
                      {candidates.filter((c) => c.status === "Passed").length})
                    </span>
                  ),
                },
                {
                  key: "Fail",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-red-600">
                      Trượt PV (
                      {candidates.filter((c) => c.status === "Fail").length})
                    </span>
                  ),
                },
                {
                  key: "Offered",
                  label: (
                    <span
                      className="px-2 font-bold uppercase text-[12px]"
                      style={{ color: "#faad14" }}
                    >
                      Offer (
                      {candidates.filter((c) => c.status === "Offered").length})
                    </span>
                  ),
                },
                {
                  key: "Hired",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-green-600">
                      Hired (
                      {candidates.filter((c) => c.status === "Hired").length})
                    </span>
                  ),
                },
                {
                  key: "Rejected",
                  label: (
                    <span className="px-2 font-bold uppercase text-[12px] text-red-600">
                      Loại (
                      {candidates.filter((c) => c.status === "Rejected").length}
                      )
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <div className="p-4">
            <div className="flex flex-row items-center gap-3">
              <Input
                placeholder="Họ tên..."
                prefix={<UserOutlined className="text-gray-400" />}
                className="flex-1"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                allowClear
              />
              <Input
                placeholder="Email..."
                prefix={<MailOutlined className="text-gray-400" />}
                className="flex-1"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                allowClear
              />
              <Input
                placeholder="Số điện thoại..."
                prefix={<PhoneOutlined className="text-gray-400" />}
                className="flex-1"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Phòng ban"
                className="flex-1"
                allowClear
                onChange={(v) => setFilterDeptId(v)}
              >
                {departments.map((d) => (
                  <Select.Option key={d.departmentID} value={d.departmentID}>
                    {d.departmentName}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl shadow-md border-none overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            loading={loading}
            rowKey="candidateID"
            pagination={{
              defaultPageSize: 10,
              showTotal: (t) => `Tổng số ${t} hồ sơ`,
            }}
          />
        </Card>
      </div>

      <CustomModal
        open={isRejectModalOpen}
        centered
        zIndex={2000}
        title={
          <span className="text-red-600 font-bold uppercase">
            Xác nhận loại ứng viên
          </span>
        }
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={() => {
          handleProcess(selectedCandidateId, "reject");
          setIsRejectModalOpen(false);
        }}
        okText="Đồng ý loại"
        okButtonProps={{ danger: true }}
        footer={[
          <Button key="back" onClick={() => setIsRejectModalOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="confirm"
            danger
            type="primary"
            onClick={() => {
              handleProcess(selectedCandidateId, "reject");
              setIsRejectModalOpen(false);
            }}
          >
            Đồng ý
          </Button>,
        ]}
      >
        <p>
          Bạn chắc chắn muốn loại ứng viên này? Email thông báo sẽ được gửi tự
          động.
        </p>
      </CustomModal>
    </div>
  );
}
