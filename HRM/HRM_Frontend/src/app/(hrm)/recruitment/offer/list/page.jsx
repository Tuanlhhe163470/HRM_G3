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
  FilterOutlined,
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

  // Search & Filter States
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL"); 

  // Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
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
        const targetStatuses = ["Offered", "Hired", "Declined"];
        const isTargetStatus = targetStatuses.includes(c.status);
        
        const isRejectedAfterOffer =
          c.status === "Rejected" && (c.offeredSalary > 0 || c.joinDate);

        return isTargetStatus || isRejectedAfterOffer;
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

  // CẬP NHẬT LOGIC LỌC TỔNG HỢP
  useEffect(() => {
    const filtered = candidates.filter((c) => {
      const matchName = c.fullName?.toLowerCase().includes(searchText.toLowerCase());
      const matchDept = filterDept ? c.departmentName === filterDept : true;
      const matchStatus = filterStatus === "ALL" ? true : c.status === filterStatus;
      
      return matchName && matchDept && matchStatus;
    });
    setFilteredCandidates(filtered);
  }, [searchText, filterDept, filterStatus, candidates]);

  const handleHire = async (id) => {
    setLoading(true);
    try {
      await axiosClient.patch(`/Candidates/${id}/hire`);
      notification.success({
        title: "Thành công",
        description: "Ứng viên đã trúng tuyển và hồ sơ nhân viên đã được khởi tạo.",
      });
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Xác nhận tuyển dụng thất bại." });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!rejectReason.trim()) {
      notification.warning({ title: "Chú ý", description: "Vui lòng nhập lý do từ chối." });
      return;
    }
    setLoading(true);
    try {
      await candidateService.declineOffer(selectedId, rejectReason);

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

  const handleViewOffer = async (record) => {
    setLoading(true);
    try {
      const detail = await candidateService.getById(record.candidateID);
      setSelectedCandidate(detail);
      setIsPreviewModalOpen(true);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể lấy thông tin chi tiết." });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Ứng viên",
      key: "info",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3 text-left">
          <Avatar className="bg-blue-100 text-blue-600" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <Text strong>{record.fullName}</Text>
            <Text type="secondary" className="text-[11px]"><MailOutlined /> {record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí & Phòng ban",
      key: "job",
      width: 250,
      render: (_, record) => (
        <div className="text-left">
          <Text strong className="block text-[13px]">{record.jobTitle}</Text>
          <Tag color="blue" className="mt-1 border-none bg-blue-50 text-blue-600">{record.departmentName}</Tag>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      width: 150,
      render: (status) => {
        let color = "orange";
        let label = "Đã gửi offer";
        if (status === "Hired") { color = "green"; label = "Đã tuyển"; }
        if (status === "Rejected") { color = "red"; label = "Loại"; }
        if (status === "Declined") { color = "volcano"; label = "Từ chối"; }

        return <Tag color={color} className="font-bold text-[10px] uppercase rounded-full px-3">{label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 220,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết Offer">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewOffer(record)} />
          </Tooltip>

          {record.status === "Offered" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                className="bg-green-600 border-none"
                onClick={() => handleHire(record.candidateID)}
              >
                Tuyển
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedId(record.candidateID);
                  setIsRejectModalOpen(true);
                }}
              >
                UV Từ chối
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
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">Quản lý kết quả Offer</h1>
          </div>

          <Space wrap>
            <Input
              placeholder="Tìm tên ứng viên..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-60 h-10 rounded-xl"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Phòng ban"
              allowClear
              className="w-48 h-10"
              onChange={(val) => setFilterDept(val)}
              options={allDepartments.map((d) => ({ label: d.departmentName, value: d.departmentName }))}
            />

            <Select
              value={filterStatus}
              className="w-40 h-10"
              onChange={(val) => setFilterStatus(val)}
              suffixIcon={<FilterOutlined />}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "Offered", label: "Đã gửi Offer" },
                { value: "Hired", label: "Đã tuyển dụng" },
                { value: "Declined", label: "Ứng viên từ chối" },
                { value: "Rejected", label: "Đã loại" },
              ]}
            />
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <Table
            dataSource={filteredCandidates}
            columns={columns}
            loading={loading}
            rowKey="candidateID"
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng cộng ${t} hồ sơ` }}
          />
        </Card>
      </div>

      {/* MODAL TỪ CHỐI */}
      <CustomModal
        open={isRejectModalOpen}
        title={<span className="text-red-600 font-bold"><InfoCircleOutlined /> XÁC NHẬN ỨNG VIÊN TỪ CHỐI OFFER</span>}
        onCancel={() => { setIsRejectModalOpen(false); setRejectReason(""); }}
        footer={[
          <Button key="back" onClick={() => setIsRejectModalOpen(false)}>Hủy</Button>,
          <Button key="submit" type="primary" danger loading={loading} onClick={handleDecline}>Xác nhận từ chối</Button>,
        ]}
        zIndex={2000}
      >
        <div className="py-2 text-left">
          <Text className="block mb-2 font-medium">Lý do ứng viên từ chối:</Text>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do UV từ chối Offer (ví dụ: Thay đổi định hướng, lương không phù hợp...)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </CustomModal>

      {/* MODAL XEM LẠI THƯ MỜI */}
      <CustomModal
        open={isPreviewModalOpen}
        title={<span className="text-[#154398] font-black uppercase">Chi tiết thư mời làm việc</span>}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsPreviewModalOpen(false)}>Đóng</Button>]}
        width={750}
        zIndex={2000}
      >
        {selectedCandidate ? (
          <div className="py-4 text-left">
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-600" />
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedCandidate.fullName}</Title>
                <Text type="secondary">{selectedCandidate.jobTitle}</Text>
              </div>
              <Tag color={selectedCandidate.status === "Hired" ? "green" : "orange"} className="ml-auto">
                {selectedCandidate.status}
              </Tag>
            </div>

            <Descriptions column={2} bordered size="small" layout="vertical">
              <Descriptions.Item label={<span><DollarOutlined /> Lương cơ bản</span>}>
                <Text strong className="text-blue-600">{selectedCandidate.offeredSalary?.toLocaleString()} VNĐ</Text>
                <div className="text-[11px] text-gray-400 italic">({docSoVietNam(selectedCandidate.offeredSalary || 0)})</div>
              </Descriptions.Item>
              <Descriptions.Item label={<span><CalendarOutlined /> Ngày nhận việc</span>}>
                <Text strong>{dayjs(selectedCandidate.joinDate).format("DD/MM/YYYY")}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* HIỂN THỊ LÝ DO NẾU LÀ TRẠNG THÁI TỪ CHỐI */}
            {selectedCandidate.status === "Declined" && (
              <div className="mt-4 p-3 bg-volcano-50 text-volcano-700 rounded-lg border border-volcano-100">
            
                <Text>{selectedCandidate.offerNote}</Text>
              </div>
            )}
          </div>
        ) : <Spin className="w-full py-10" />}
      </CustomModal>
    </div>
  );
}