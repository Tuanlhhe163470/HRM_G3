"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Card, Typography, App, Input, Avatar, Tooltip, Select, Tabs } from "antd";
import { 
  SearchOutlined, 
  FilePdfOutlined, 
  UserOutlined,
  SendOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckOutlined
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import axiosClient from "@/lib/axiosClient";
import { PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants/pageSizeOptions";
import CustomModal from "@/components/Modal/CustomModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ShortlistCandidatePage() {
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); 
  
  // States bộ lọc
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDeptId, setFilterDeptId] = useState(null);

  // Modal States chung cho cả Single và Bulk Reject
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState("single"); // "single" hoặc "bulk"
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidateRes, deptRes] = await Promise.all([
        candidateService.getAdminList(),
        axiosClient.get("/Departments"),
      ]);
      const shortlist = candidateRes.filter(c => c.status === "Screening" || c.status === "Manager_Review");
      setCandidates(shortlist);
      setFilteredCandidates(shortlist);
      setDepartments(deptRes.data || deptRes);
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const filtered = candidates.filter((item) => {
      const matchTab = activeTab === "ALL" || item.status === activeTab;
      const matchName = !searchName || item.fullName?.toLowerCase().includes(searchName.toLowerCase());
      const matchEmail = !searchEmail || item.email?.toLowerCase().includes(searchEmail.toLowerCase());
      const matchPhone = !searchPhone || item.phone?.includes(searchPhone);
      const matchDept = !filterDeptId || item.departmentID === filterDeptId;
      return matchTab && matchName && matchEmail && matchPhone && matchDept;
    });
    setFilteredCandidates(filtered);
  }, [searchName, searchEmail, searchPhone, filterDeptId, activeTab, candidates]);

  // Xử lý Gửi Manager
  const handleSendToManager = async (ids) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    try {
      setLoading(true);
      await Promise.all(idList.map(id => candidateService.processCandidate(id, "send_to_manager")));
      notification.success({ title: "Thành công", description: `Đã gửi duyệt ${idList.length} hồ sơ.` });
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Lỗi gửi duyệt." });
    } finally {
      setLoading(false);
    }
  };

  // QUẢN LÝ MODAL LOẠI
  const openSingleReject = (id) => {
    setRejectMode("single");
    setSelectedCandidateId(id);
    setIsRejectModalOpen(true);
  };

  const openBulkReject = () => {
    setRejectMode("bulk");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    setLoading(true);
    try {
      if (rejectMode === "single") {
        await candidateService.processCandidate(selectedCandidateId, "reject");
      } else {
        await Promise.all(selectedRowKeys.map(id => candidateService.processCandidate(id, "reject")));
      }
      notification.success({ title: "Thành công", description: "Đã loại ứng viên và gửi email thông báo." });
      setSelectedRowKeys([]);
      setIsRejectModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể thực hiện thao tác." });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: <div className="text-center w-full">Thông tin ứng viên</div>,
      key: "info",
      width: "30%",
      render: (_, record) => (
        <div className="flex items-center gap-3 text-left">
          <Avatar size={40} className="bg-[#154398]" icon={<UserOutlined />} />
          <div className="flex flex-col overflow-hidden">
            <Text strong className="text-[#154398] truncate">{record.fullName}</Text>
            <Text type="secondary" className="text-[12px]"><MailOutlined className="mr-1" />{record.email}</Text>
            <Text type="secondary" className="text-[12px]"><PhoneOutlined className="mr-1" />{record.phone || "N/A"}</Text>
          </div>
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Vị trí & Phòng ban</div>,
      key: "job",
      render: (_, record) => (
        <div className="flex flex-col text-left">
          <Text className="text-gray-700 font-medium">{record.jobTitle}</Text>
          <Text className="text-[11px] text-[#00aeef] font-bold uppercase">Phòng: {record.departmentName}</Text>
        </div>
      )
    },
    {
      title: <div className="text-center w-full">Trạng thái</div>,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const config = { Screening: { color: "cyan", text: "Cần lọc" }, Manager_Review: { color: "orange", text: "Chờ duyệt" } };
        return <Tag color={config[status]?.color} className="font-bold px-3 py-0.5 rounded-full text-[10px] uppercase">{config[status]?.text || status}</Tag>;
      }
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
          {record.status === "Screening" && (
            <>
              <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => openSingleReject(record.candidateID)}>Loại</Button>
              <Button type="primary" size="small" className="bg-[#154398] border-none" icon={<SendOutlined />} onClick={() => handleSendToManager(record.candidateID)}>Gửi Manager</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Title level={3} className="text-[#154398] font-black uppercase m-0">Danh sách rút gọn</Title>
          <Space>
            {activeTab !== "Manager_Review" && (
              <>
                <Button 
                  danger size="large" icon={<CloseCircleOutlined />} 
                  disabled={selectedRowKeys.length === 0 || loading} 
                  onClick={openBulkReject} 
                >
                  Loại bỏ ({selectedRowKeys.length})
                </Button>
                <Button 
                  type="primary" size="large" icon={<CheckOutlined />} 
                  disabled={selectedRowKeys.length === 0 || loading} 
                  className="bg-green-600 hover:bg-green-700 border-none rounded-lg shadow-md"
                  onClick={() => handleSendToManager(selectedRowKeys)}
                >
                  Gửi duyệt Manager ({selectedRowKeys.length})
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* GỘP TABS VÀ FILTER VÀO 1 KHỐI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 text-left">
          <div className="px-4 pt-3 bg-[#fcfcfc] border-b border-gray-100">
            <Tabs 
              activeKey={activeTab} size="small"
              onChange={(key) => { setActiveTab(key); setSelectedRowKeys([]); }}
              tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
              items={[
                { key: "ALL", label: <span className="px-2 font-bold uppercase text-[13px]">Tất cả ({candidates.length})</span> },
                { key: "Screening", label: <span className="px-2 font-bold uppercase text-[13px] text-cyan-600">Cần lọc ({candidates.filter(c => c.status === "Screening").length})</span> },
                { key: "Manager_Review", label: <span className="px-2 font-bold uppercase text-[13px] text-orange-600">Chờ duyệt ({candidates.filter(c => c.status === "Manager_Review").length})</span> },
              ]}
            />
          </div>
          <div className="p-4">
            <div className="flex flex-row items-center gap-3">
              <Input placeholder="Họ tên..." prefix={<UserOutlined className="text-gray-400" />} className="flex-1" value={searchName} onChange={e => setSearchName(e.target.value)} allowClear />
              <Input placeholder="Email..." prefix={<MailOutlined className="text-gray-400" />} className="flex-1" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} allowClear />
              <Input placeholder="Số điện thoại..." prefix={<PhoneOutlined className="text-gray-400" />} className="flex-1" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} allowClear />
              <Select placeholder="Phòng ban" className="flex-1" allowClear onChange={v => setFilterDeptId(v)}>
                {departments.map(d => <Select.Option key={d.departmentID} value={d.departmentID}>{d.departmentName}</Select.Option>)}
              </Select>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl shadow-md border-none overflow-hidden">
          <Table
            rowSelection={activeTab !== "Manager_Review" ? { selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) } : null}
            columns={columns} dataSource={filteredCandidates} loading={loading} rowKey="candidateID"
            pagination={{ defaultPageSize: 10, showTotal: (t) => `Tổng số ${t} ứng viên` }}
          />
        </Card>
      </div>

      {/* CUSTOM MODAL DÙNG CHUNG */}
      <CustomModal
        open={isRejectModalOpen}
        centered zIndex={2000}
        title={<span className="text-red-600 font-bold uppercase">{rejectMode === "bulk" ? "Loại hàng loạt ứng viên" : "Xác nhận loại ứng viên"}</span>}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsRejectModalOpen(false)}>Hủy bỏ</Button>,
          <Button key="submit" danger type="primary" loading={loading} onClick={handleConfirmReject}>Xác nhận loại</Button>,
        ]}
      >
        <div className="py-4 text-center">
          <Text className="text-lg">
            {rejectMode === "bulk" 
              ? `Bạn có chắc chắn muốn loại bỏ đồng loạt ${selectedRowKeys.length} ứng viên đã chọn?` 
              : "Bạn có chắc chắn muốn loại ứng viên này khỏi danh sách?"}
          </Text>
          <div className="mt-2 text-gray-500 text-sm italic">* Hệ thống sẽ tự động gửi email thông báo từ chối cho ứng viên.</div>
        </div>
      </CustomModal>
    </div>
  );
}