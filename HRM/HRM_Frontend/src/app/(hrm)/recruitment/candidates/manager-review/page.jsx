"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Card, Typography, App, Input, Avatar, Tooltip, Select } from "antd";
import { 
  SearchOutlined, 
  FilePdfOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import axiosClient from "@/lib/axiosClient";
import { PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants/pageSizeOptions";
import CustomModal from "@/components/Modal/CustomModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ManagerApprovalPage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); 
  
  // Bộ lọc tìm kiếm
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // Modal States cho Phê duyệt/Từ chối
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("approve"); 
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const candidateRes = await candidateService.getAdminList();

      // Chỉ hiển thị những người đang chờ Manager duyệt
      const pendingList = candidateRes.filter(c => c.status === "Manager_Review");
      
      setCandidates(pendingList);
      setFilteredCandidates(pendingList);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể tải danh sách phê duyệt." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const filtered = candidates.filter((item) => {
      const matchName = !searchName || item.fullName?.toLowerCase().includes(searchName.toLowerCase());
      const matchEmail = !searchEmail || item.email?.toLowerCase().includes(searchEmail.toLowerCase());
      return matchName && matchEmail;
    });
    setFilteredCandidates(filtered);
  }, [searchName, searchEmail, candidates]);

  // Xử lý Phê duyệt hoặc Từ chối
  const handleAction = async () => {
    setLoading(true);
    try {
      const ids = selectedCandidateId ? [selectedCandidateId] : selectedRowKeys;
      const actionType = modalMode === "approve" ? "manager_approve" : "manager_reject";

      await Promise.all(ids.map(id => candidateService.processCandidate(id, actionType)));
      
      notification.success({ 
        title: "Thành công", 
        description: modalMode === "approve" ? "Đã phê duyệt hồ sơ." : "Đã từ chối hồ sơ." 
      });
      
      setIsModalOpen(false);
      setSelectedRowKeys([]);
      setSelectedCandidateId(null);
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Thao tác thất bại." });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    setSelectedCandidateId(id);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: <div className="text-center w-full">Thông tin ứng viên</div>,
      key: "info",
      width: "20%",
      render: (_, record) => (
        <div className="flex items-center gap-3 text-left">
          <Avatar size={42} className="bg-[#00aeef]" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <Text strong className="text-[#154398]">{record.fullName}</Text>
            <Text type="secondary" className="text-[12px]">{record.email}</Text>
            <Text type="secondary" className="text-[12px]">{record.phone || "N/A"}</Text>
          </div>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Vị trí ứng tuyển</div>,
      key: "job",
      render: (_, record) => (
        <div className="text-left">
          <Text className="font-medium text-gray-700">{record.jobTitle}</Text>
          <br />
          <Tag color="blue" className="mt-1">Phòng: {record.departmentName}</Tag>
        </div>
      )
    },
    {
      title: <div className="text-center w-full">Thời gian gửi yêu cầu</div>,
      dataIndex: "updatedAt",
      render: (date) => (
        <div className="text-center">
          <Text className="block">{dayjs(date).format("DD/MM/YYYY")}</Text>
          <Text className="text-[11px] text-gray-400">{dayjs(date).format("HH:mm")}</Text>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Thao tác</div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem CV">
            <Button type="text" icon={<FilePdfOutlined className="text-red-500 text-xl" />} onClick={() => window.open(`https://localhost:7167${record.cvUrl}`, "_blank")} />
          </Tooltip>
          <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => openModal("reject", record.candidateID)}>Từ chối</Button>
          <Button type="primary" size="small" className="bg-green-600 border-none" icon={<CheckCircleOutlined />} onClick={() => openModal("approve", record.candidateID)}>Duyệt</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">
          Phê duyệt hồ sơ ứng viên
        </h1>
          <Space>
            <Button danger disabled={selectedRowKeys.length === 0} onClick={() => openModal("reject")}>Từ chối hàng loạt ({selectedRowKeys.length})</Button>
            <Button type="primary" className="bg-green-600 border-none" disabled={selectedRowKeys.length === 0} onClick={() => openModal("approve")}>Phê duyệt hàng loạt ({selectedRowKeys.length})</Button>
          </Space>
        </div>

        {/* Gộp thanh lọc */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-row items-center gap-4">
            <Tag color="#154398" icon={<SafetyCertificateOutlined />} className="px-3 py-1 rounded-md border-none uppercase font-bold">Bộ lọc</Tag>
            <Input placeholder="Tìm theo tên..." prefix={<UserOutlined className="text-gray-400" />} className="flex-1" value={searchName} onChange={e => setSearchName(e.target.value)} allowClear />
            <Input placeholder="Tìm theo email..." prefix={<MailOutlined className="text-gray-400" />} className="flex-1" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} allowClear />
          </div>
        </div>

        <Card className="rounded-2xl shadow-md border-none overflow-hidden">
          <Table
            rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
            columns={columns} dataSource={filteredCandidates} loading={loading} rowKey="candidateID"
            pagination={{ defaultPageSize: 10, showTotal: (t) => `Còn ${t} hồ sơ cần bạn phê duyệt` }}
          />
        </Card>
      </div>

      <CustomModal
        open={isModalOpen} centered zIndex={2000}
        title={<span className={modalMode === "approve" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
          {modalMode === "approve" ? "XÁC NHẬN PHÊ DUYỆT" : "XÁC NHẬN TỪ CHỐI"}
        </span>}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>Quay lại</Button>,
          <Button key="submit" type="primary" danger={modalMode === "reject"} className={modalMode === "approve" ? "bg-green-600 border-none" : ""} loading={loading} onClick={handleAction}>
            Xác nhận
          </Button>,
        ]}
      >
        <div className="py-4 text-center text-lg">
          {modalMode === "approve" 
            ? "Bạn có đồng ý đưa ứng viên này vào vòng phỏng vấn?" 
            : "Bạn chắc chắn muốn từ chối hồ sơ này? (Ứng viên sẽ nhận được email thông báo tự động từ hệ thống)"}
        </div>
      </CustomModal>
    </div>
  );
}