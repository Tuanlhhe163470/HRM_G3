"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Card,
  App,
  Tooltip,
  Modal,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import useNotice from "@/components/Notice";
import dayjs from "dayjs";
import "./approval.scss";

const { Title, Text } = Typography;

export default function ApproveRequestPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState("");
  const notice = useNotice();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await jobPostingService.getPending();
      setData(res);
    } catch (err) {
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không thể kết nối API hoặc bạn không có quyền truy cập.",
        isSuccess: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, isApproved) => {
    try {
      await jobPostingService.approve(id, isApproved);
      notice({
        msg: isApproved ? "Đã phê duyệt yêu cầu" : "Đã từ chối yêu cầu",
        isSuccess: true,
      });
      loadRequests();
    } catch (err) {
      notice({
        msg: "Thao tác thất bại",
        desc: err.message,
        isSuccess: false,
      });
    }
  };

  const centerHeader = () => ({
    style: { textAlign: "center" },
  });

  const columns = [
    {
      title: "THÔNG TIN YÊU CẦU",
      key: "info",
      onHeaderCell: centerHeader,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text className="job-title" strong>
            {record.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Mã tin: #{record.jobID}
          </Text>
        </Space>
      ),
    },
    {
      title: "VỊ TRÍ",
      key: "position",
      align: "center",
      render: (_, record) => (
        <Tag color="blue" style={{ margin: 0, fontWeight: 500 }}>
          {record.position?.positionName}
        </Tag>
      ),
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "vacancies",
      key: "vacancies",
      align: "center",
      render: (count) => <Text strong>{count} </Text>,
    },
    {
      title: "NGƯỜI TẠO",
      dataIndex: "createdByName",
      key: "createdByName",
      align: "center",
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          <UserOutlined style={{ fontSize: 12, color: "#1890ff" }} />
          <Text>{record.createdByUserAccount?.employee?.fullName}</Text>
        </Space>
      ),
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "NGÀY HẾT HẠN",
      dataIndex: "expiryDate",
      key: "expiryDate",
      align: "center",
      render: (date) => (
        <Space>
          <ScheduleOutlined style={{ color: "#ff4d4f" }} />
          <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>
        </Space>
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      width: 280,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem nội dung chi tiết">
            <Button
              className="btn-action"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedJD(record.description);
                setIsPreviewOpen(true);
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            className="btn-action"
            icon={<CheckCircleOutlined />}
            onClick={() => handleAction(record.jobID, true)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Duyệt
          </Button>
          <Button
            danger
            type="primary"
            className="btn-action"
            icon={<CloseCircleOutlined />}
            onClick={() => handleAction(record.jobID, false)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const departmentDisplayName =
    data.length > 0 ? data[0].department?.departmentName : "...";

  return (
    <div className="approval-container">
      <Card variant="borderless">
        <div className="header-section">
          <Title level={3} className="title-text">
            DANH SÁCH CHỜ PHÊ DUYỆT - {departmentDisplayName}
          </Title>
          <Badge
            count={data.length}
            overflowCount={99}
            style={{ backgroundColor: "#faad14" }}
          >
            <Tag
              color="gold"
              style={{ padding: "4px 12px", borderRadius: "12px", margin: 0 }}
            >
              Yêu cầu mới
            </Tag>
          </Badge>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="jobID"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} yêu cầu`,
          }}
          bordered
        />

        <Modal
          title={
            <Space>
              <EyeOutlined style={{ color: "#00aeef" }} />
              <span style={{ fontSize: "15px" }}>CHI TIẾT MÔ TẢ CÔNG VIỆC</span>
            </Space>
          }
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsPreviewOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={1000}
          centered
          maskClosable
          styles={{
            body: {
              maxHeight: "65vh",
              overflowY: "auto",
              padding: "16px",
            },
          }}
        >
          <div
            className="jd-preview-container quill-content-view"
            dangerouslySetInnerHTML={{ __html: selectedJD }}
          />
        </Modal>
      </Card>
    </div>
  );
}
