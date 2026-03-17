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
  Descriptions,
  Divider,
  Spin,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import axiosClient from "@/lib/axiosClient";
import CustomModal from "@/components/Modal/CustomModal";
import { docSoVietNam } from "@/lib/stringsUtils";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function OfferListPage() {
  const [candidates, setCandidates] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);

  // Modal Từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal Xem lại Offer
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidateRes, deptRes] = await Promise.all([
        candidateService.getAdminList(),
        axiosClient.get("/Departments"),
      ]);

      const offerRelated = candidateRes.filter((c) => {
        const isOfferedOrHired = ["Offered", "Hired"].includes(c.status);
        const isRejectedAfterOffer =
          c.status === "Rejected" && (c.offeredSalary > 0 || c.joinDate);

        return isOfferedOrHired || isRejectedAfterOffer;
      });

      setCandidates(offerRelated);
      setFilteredCandidates(offerRelated);
      setAllDepartments(deptRes.data || deptRes);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải danh sách Offer.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = candidates.filter((c) => {
      const matchName = c.fullName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchDept = filterDept ? c.departmentName === filterDept : true;
      return matchName && matchDept;
    });
    setFilteredCandidates(filtered);
  }, [searchText, filterDept, candidates]);

  const handleHire = async (id) => {
    setLoading(true);
    try {
      await axiosClient.patch(`/Candidates/${id}/hire`);
      notification.success({
        title: "Thành công",
        description: "Ứng viên đã trúng tuyển và Job đã được cập nhật.",
      });
      fetchData();
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Xác nhận tuyển dụng thất bại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!rejectReason.trim()) {
      notification.warning({
        title: "Chú ý",
        description: "Vui lòng nhập lý do từ chối.",
      });
      return;
    }
    setLoading(true);
    try {
      await axiosClient.patch(
        `/Candidates/${selectedId}/decline-offer`,
        JSON.stringify(rejectReason),
        { headers: { "Content-Type": "application/json" } },
      );

      notification.success({
        title: "Đã cập nhật",
        description: "Đã ghi nhận ứng viên từ chối Offer.",
      });
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Thao tác thất bại." });
    } finally {
      setLoading(false);
    }
  };

  // HÀM XEM CHI TIẾT OFFER
  const handleViewOffer = async (record) => {
    setLoading(true);
    try {
      // Lấy lại chi tiết ứng viên để đảm bảo có thông tin Offer mới nhất
      const detail = await candidateService.getById(record.candidateID);
      setSelectedCandidate(detail);
      setIsPreviewModalOpen(true);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể lấy thông tin chi tiết.",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: <div className="text-center w-full">Ứng viên</div>,
      key: "info",
      width: 260,
      render: (_, record) => (
        <Space>
          <Avatar
            className="bg-blue-100 text-blue-600"
            icon={<UserOutlined />}
          />
          <div className="flex flex-col text-left">
            <Text strong className="block">
              {record.fullName}
            </Text>
            <Text
              type="secondary"
              className="text-[11px] flex items-center gap-1"
            >
              <MailOutlined /> {record.email}
            </Text>
            <Text
              type="secondary"
              className="text-[11px] flex items-center gap-1"
            >
              <PhoneOutlined /> {record.phone || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: <div className="text-center w-full">Phòng ban</div>,
      dataIndex: "departmentName",
      width: 220,
      render: (dept) => (
        <div className="text-left">
          <Tag
            color="blue"
            className="px-3 py-0.5 rounded-md border-none bg-blue-50 text-blue-600 font-medium"
          >
            {dept || "N/A"}
          </Tag>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Vị trí ứng tuyển</div>,
      dataIndex: "jobTitle",
      ellipsis: true,
      render: (title) => (
        <Tooltip title={title} placement="topLeft">
          <span className="text-gray-600 text-left block">{title}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => {
        let color = "orange";
        let label = "Offer";
        if (status === "Hired") {
          color = "green";
          label = "Đã tuyển";
        }
        if (status === "Rejected") {
          color = "red";
          label = "Từ chối";
        }

        return (
          <Tag
            color={color}
            className="font-bold text-[9px] uppercase rounded-full"
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 280,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem nội dung thư mời">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewOffer(record)}
            />
          </Tooltip>

          {record.status === "Offered" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                className="bg-green-600 hover:bg-green-700 border-none rounded-md"
                onClick={() => handleHire(record.candidateID)}
              >
                Tuyển dụng
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                className="rounded-md"
                onClick={() => {
                  setSelectedId(record.candidateID);
                  setIsRejectModalOpen(true);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <FileSearchOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">
              Quản lý kết quả Offer
            </h1>
          </div>

          <Space size="middle">
            <Input
              placeholder="Tìm tên ứng viên..."
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
              options={allDepartments.map((d) => ({
                label: d.departmentName,
                value: d.departmentName,
              }))}
            />
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            dataSource={filteredCandidates}
            columns={columns}
            loading={loading}
            rowKey="candidateID"
            pagination={{
              pageSize: 10,
              showTotal: (t) => `Tổng cộng ${t} hồ sơ`,
            }}
            locale={{ emptyText: "Không có dữ liệu offer phù hợp" }}
          />
        </Card>
      </div>

      {/* MODAL TỪ CHỐI */}
      <CustomModal
        open={isRejectModalOpen}
        title={
          <span className="text-red-600 font-bold">
            <InfoCircleOutlined /> XÁC NHẬN TỪ CHỐI OFFER
          </span>
        }
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
        }}
        onOk={handleDecline}
        okText="Xác nhận"
        zIndex={2000}
        okButtonProps={{ danger: true, loading: loading }}
      >
        <div className="py-2">
          <Text className="block mb-2 font-medium">
            Lý do ứng viên từ chối:
          </Text>
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: Đã nhận việc nơi khác..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-lg"
          />
        </div>
      </CustomModal>

      {/* MODAL XEM LẠI THƯ MỜI (OFFER PREVIEW) */}
      <CustomModal
        open={isPreviewModalOpen}
        title={
          <span className="text-[#154398] font-black uppercase">
            Chi tiết thư mời làm việc
          </span>
        }
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
        zIndex={2000}
      >
        {selectedCandidate ? (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                className="bg-blue-600"
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedCandidate.fullName}
                </Title>
                <Text type="secondary">{selectedCandidate.jobTitle}</Text>
              </div>
              <div className="ml-auto">
                <Tag
                  color={
                    selectedCandidate.status === "Hired" ? "green" : "orange"
                  }
                >
                  {selectedCandidate.status}
                </Tag>
              </div>
            </div>

            <Descriptions column={2} bordered size="small" layout="vertical">
              <Descriptions.Item
                label={
                  <span>
                    <DollarOutlined /> Lương cơ bản
                  </span>
                }
              >
                <Text strong className="text-blue-600">
                  {selectedCandidate.offeredSalary?.toLocaleString()} VNĐ
                </Text>
                <div className="text-[11px] text-gray-400 italic">
                  ({docSoVietNam(selectedCandidate.offeredSalary || 0)})
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày nhận việc
                  </span>
                }
              >
                <Text strong>
                  {dayjs(selectedCandidate.joinDate).format("DD/MM/YYYY")}
                </Text>
              </Descriptions.Item>
              {selectedCandidate.comments && (
                <Descriptions.Item label="Nhận xét từ Manager" span={2}>
                  <Text italic>{selectedCandidate.comments}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedCandidate.status === "Rejected" && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <Text strong>Lý do từ chối: </Text>
                <Text>{selectedCandidate.rejectReason || "N/A"}</Text>
              </div>
            )}
          </div>
        ) : (
          <Spin />
        )}
      </CustomModal>
    </div>
  );
}
