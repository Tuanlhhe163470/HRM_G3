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
  Modal,
  Descriptions,
  DatePicker,
  Select,
} from "antd";
import {
  SearchOutlined,
  FilePdfOutlined,
  UserOutlined,
  EyeOutlined,
  HistoryOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  StarOutlined,
  MessageOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import candidateService from "@/services/Recruitment/candidateService";
import { decodeJWT } from "@/lib/base64";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ManagerEvaluationHistoryPage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);

  // States bộ lọc
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // States cho Modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const { notification } = App.useApp();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        setManagerInfo({
          deptId: payload.DepartmentId ? parseInt(payload.DepartmentId) : null,
        });
      }
    }
  }, []);

  const fetchData = async () => {
    if (!managerInfo?.deptId) return;
    setLoading(true);
    try {
      const res = await candidateService.getAdminList();
      const historyList = res.filter(
        (c) =>
          (c.status === "Passed" || c.status === "Fail") &&
          Number(c.departmentID) === Number(managerInfo.deptId),
      );
      setCandidates(historyList);
      setFilteredCandidates(historyList);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải lịch sử.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [managerInfo]);

  // Logic lọc dữ liệu tổng hợp
  useEffect(() => {
    const filtered = candidates.filter((item) => {
      // 1. Lọc theo tên
      const matchName = !searchName || item.fullName?.toLowerCase().includes(searchName.toLowerCase());
      
      // 2. Lọc theo ngày phỏng vấn (so sánh ngày/tháng/năm)
      const matchDate = !filterDate || (item.interviewDate && dayjs(item.interviewDate).isSame(filterDate, 'day'));
      
      // 3. Lọc theo trạng thái
      const matchStatus = filterStatus === "ALL" || item.status === filterStatus;

      return matchName && matchDate && matchStatus;
    });
    setFilteredCandidates(filtered);
  }, [searchName, filterDate, filterStatus, candidates]);

  const handleViewDetail = async (candidateId) => {
    setLoading(true);
    try {
      const detail = await candidateService.getById(candidateId);
      setSelectedCandidate(detail);
      setIsDetailModalOpen(true);
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
      title: "Ứng viên",
      key: "info",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-[#154398]/10 text-[#154398]"
            icon={<UserOutlined />}
          />
          <div className="flex flex-col text-left">
            <Text strong className="text-[#154398]">
              {record.fullName}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí tuyển dụng",
      dataIndex: "jobTitle",
      render: (text) => (
        <Text className="text-[13px] font-medium text-slate-600">{text}</Text>
      ),
    },
    {
      title: "Ngày PV",
      dataIndex: "interviewDate",
      align: "center",
      render: (date) => (
        <Text className="text-[12px]">{date ? dayjs(date).format("DD/MM/YYYY") : "—"}</Text>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <Tag
          color={status === "Passed" ? "success" : "error"}
          className="font-bold uppercase text-[10px] min-w-[70px] text-center"
        >
          {status === "Passed" ? "ĐẠT" : "LOẠI"}
        </Tag>
      ),
    },
    {
      title: "Điểm chuyên môn",
      dataIndex: "score",
      align: "center",
      render: (score) => (
        <Tag color="blue" className="font-bold border-none bg-blue-50 text-blue-600">
          {score}/10
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem CV">
            <Button
              type="text"
              icon={<FilePdfOutlined className="text-red-500 text-lg" />}
              onClick={() =>
                window.open(`https://localhost:7167${record.cvUrl}`, "_blank")
              }
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            className="bg-[#154398] rounded-lg"
            onClick={() => handleViewDetail(record.candidateID)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 text-left">
        <div className="flex items-center gap-3">
        <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">
          DANH SÁCH KẾT QUẢ
        </h1>
        </div>

        {/* KHU VỰC BỘ LỌC */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px]">
              <Text type="secondary" className="text-[11px] font-bold uppercase block mb-1 ml-1">Tìm kiếm</Text>
              <Input
                placeholder="Họ tên ứng viên..."
                prefix={<SearchOutlined className="text-slate-400" />}
                className="h-10 rounded-xl bg-slate-50 border-none"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                allowClear
              />
            </div>

            <div className="w-[250px]">
              <Text type="secondary" className="text-[11px] font-bold uppercase block mb-1 ml-1">Ngày phỏng vấn</Text>
              <DatePicker 
                className="w-full h-10 rounded-xl bg-slate-50 border-none" 
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
              />
            </div>

            <div className="w-[160px]">
              <Text type="secondary" className="text-[11px] font-bold uppercase block mb-1 ml-1">Kết quả</Text>
              <Select
                defaultValue="ALL"
                value={filterStatus}
                className="w-full h-10 custom-select"
                onChange={(val) => setFilterStatus(val)}
                options={[
                  { value: "ALL", label: "Tất cả kết quả" },
                  { value: "Passed", label: "Đạt" },
                  { value: "Fail", label: "Loại" },
                ]}
              />
            </div>
            
            <Button 
              icon={<HistoryOutlined />} 
              className="mt-5 rounded-xl border-slate-200 h-10"
              onClick={() => {
                setSearchName("");
                setFilterDate(null);
                setFilterStatus("ALL");
              }}
            >
              Làm mới
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            loading={loading}
            rowKey="candidateID"
            pagination={{
              defaultPageSize: 10,
              showTotal: (t) => `Tổng cộng ${t} kết quả`,
            }}
          />
        </Card>
      </div>

      {/* MODAL CHI TIẾT ĐÁNH GIÁ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#154398] uppercase font-black border-b pb-3 mb-0">
            <EyeOutlined /> Chi tiết đánh giá phỏng vấn
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        zIndex={2000}
        footer={[
          <Button
            key="close"
            type="primary"
            className="bg-[#154398] rounded-lg h-10 px-8"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={700}
        centered
      >
        {selectedCandidate && (
          <div className="py-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
              <Avatar
                size={64}
                className="bg-blue-100 text-blue-600 border-2 border-white shadow-sm"
                icon={<UserOutlined />}
              />
              <div>
                <Title level={4} className="m-0 text-[#154398]">
                  {selectedCandidate.fullName}
                </Title>
                <Text type="secondary">
                  {selectedCandidate.email} | {selectedCandidate.phone}
                </Text>
              </div>
              <div className="ml-auto text-right">
                <Tag
                  color={selectedCandidate.status === "Passed" ? "success" : "error"}
                  className="m-0 font-bold uppercase"
                >
                  {selectedCandidate.status === "Passed" ? "Đạt phỏng vấn" : "Không đạt"}
                </Tag>
              </div>
            </div>

            <Descriptions
              bordered
              column={1}
              styles={{
                label: { fontWeight: "bold", width: "180px", background: "#fcfcfc" },
              }}
            >
              <Descriptions.Item label={<span><StarOutlined /> Vị trí tuyển dụng</span>}>
                <Text strong>{selectedCandidate.jobTitle}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span><CalendarOutlined /> Ngày phỏng vấn</span>}>
                {selectedCandidate.interviewDate ? dayjs(selectedCandidate.interviewDate).format("DD/MM/YYYY HH:mm") : ""}
              </Descriptions.Item>
              <Descriptions.Item label={<span><VideoCameraOutlined /> Hình thức</span>}>
                {selectedCandidate.interviewType}
              </Descriptions.Item>
              <Descriptions.Item label={<span><EnvironmentOutlined /> Địa điểm</span>}>
                {selectedCandidate.location}
              </Descriptions.Item>
              <Descriptions.Item label={<span><StarOutlined className="text-amber-500" /> Điểm số chuyên môn</span>}>
                <Tag color="blue" className="font-bold text-lg px-3 py-1">
                  {selectedCandidate.score}/10
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span><MessageOutlined /> Nhận xét chi tiết</span>}>
                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 italic text-slate-700 min-h-[80px]">
                  {selectedCandidate.comments}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      
    </div>
  );
}