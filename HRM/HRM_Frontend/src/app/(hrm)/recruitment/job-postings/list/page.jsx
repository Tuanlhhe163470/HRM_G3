"use client";
import useNotice from "@/components/Notice";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  RocketOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./job-list.scss";

const { Title, Text } = Typography;

export default function JobManagementPage() {
  const router = useRouter();
  const { modal, notification, message } = App.useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // States cho Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();
  const notice = useNotice();

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobPostingService.getAll();
      setData(res);
    } catch (err) {
      notice({ msg: "Lỗi tải dữ liệu", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Xử lý Cập nhật
  const handleUpdate = async (values) => {
    try {
      await jobPostingService.update(selectedRecord.jobID, values);
      notice({ msg: "Cập nhật thành công!", isSuccess: true });
      setIsEditOpen(false);
      loadJobs();
    } catch (err) {
      notice({ msg: "Cập nhật thất bại", desc: err.message, isSuccess: false });
    }
  };

  const centerHeader = () => ({ style: { textAlign: "center" } });

  // 1. Công khai tin (Approved -> Open)
  const handlePublish = async (record) => {
    // Kiểm tra xem record và jobID có tồn tại không
    if (!record || !record.jobID) {
      console.error("Dữ liệu record không hợp lệ:", record);
      return;
    }

    try {
      // Truyền jobID và nội dung mô tả
      await jobPostingService.publish(record.jobID, record.description);
      notice({ msg: "Tin đã được đăng công khai!", isSuccess: true });
      loadJobs();
    } catch (err) {
      notice({ msg: "Lỗi đăng tin", desc: err.message, isSuccess: false });
    }
  };

  // 2. Đóng tin (Open -> Closed)
  const handleClose = async (id) => {
    try {
      await jobPostingService.close(id);
      notice({ msg: "Đã đóng tin tuyển dụng", isSuccess: true });
      loadJobs();
    } catch (err) {
      notice({ msg: "Thao tác thất bại", isSuccess: false });
    }
  };

  // 3. Mở lại tin (Closed -> Open)
  const handleReopen = (record) => {
    let selectedDate = dayjs().add(7, "day");

    // Sử dụng modal từ App.useApp() thay vì Modal tĩnh
    modal.confirm({
      title: "GIA HẠN & MỞ LẠI TIN TUYỂN DỤNG",
      content: (
        <div>
          <Text>Chọn ngày hết hạn mới:</Text>
          <DatePicker
            style={{ width: "100%", marginTop: 10 }}
            format="DD/MM/YYYY"
            defaultValue={selectedDate}
            onChange={(date) => {
              selectedDate = date;
            }}
          />
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await jobPostingService.reopen(
            record.jobID,
            selectedDate.toISOString(),
          );

          // SỬA TẠI ĐÂY: Dùng đúng thuộc tính theo chuẩn mới của Ant Design
          notification.success({
            title: "Thành công", // Tiêu đề chính
            description: "Đã mở lại tin tuyển dụng thành công",
          });

          loadJobs();
        } catch (err) {
          notification.error({
            title: "Lỗi hệ thống",
            description: err.message || "Không thể thực hiện thao tác này",
          });
        }
      },
    });
  };

  const columns = [
    {
      title: "THÔNG TIN TIN ĐĂNG",
      key: "info",
      onHeaderCell: centerHeader,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong style={{ color: "#1890ff" }}>
            {record.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            ID: #{record.jobID}
          </Text>
        </Space>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      align: "center",
      onHeaderCell: centerHeader,
      render: (status) => {
        let color =
          status === "Approved"
            ? "green"
            : status === "Pending"
              ? "gold"
              : "blue";
        if (status === "Open") color = "cyan";
        if (status === "Rejected") color = "volcano";
        return (
          <Tag color={color} style={{ minWidth: 80, textAlign: "center" }}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "vacancies",
      key: "vacancies",
      align: "center",
      onHeaderCell: centerHeader,
    },
    {
      title: "THAO TÁC",
      key: "action",
      width: 200,
      align: "center",
      fixed: "right",
      onHeaderCell: centerHeader,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/recruitment/job-postings/${record.jobID}/view`)
              }
            />
          </Tooltip>

          {/* CHỈNH SỬA: Không sửa tin bị Từ chối hoặc Đã đóng */}
          <Tooltip title="Chỉnh sửa">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              disabled={
                record.status === "Rejected" || record.status === "Closed"
              }
              onClick={() =>
                router.push(`/recruitment/job-postings/${record.jobID}/edit`)
              }
            />
          </Tooltip>

          {/* PUBLISH: Chỉ dành cho tin đã Approved */}
          {record.status === "Approved" && (
            <Tooltip title="Đăng tin công khai">
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => handlePublish(record)}
                style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
              />
            </Tooltip>
          )}

          {/* CLOSE: Dành cho tin đang Open */}
          {record.status === "Open" && (
            <Tooltip title="Đóng tin (Dừng nhận hồ sơ)">
              <Button
                shape="circle"
                danger
                icon={<StopOutlined />}
                onClick={() => handleClose(record.jobID)}
              />
            </Tooltip>
          )}

          {/* REOPEN: Dành cho tin đã Closed */}
          {record.status === "Closed" && (
            <Tooltip title="Mở lại tin">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => handleReopen(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="job-management-container">
      <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">QUẢN LÝ YÊU CẦU & TIN TUYỂN DỤNG</h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="jobID"
        loading={loading}
        bordered
      />

      {/* MODAL XEM CHI TIẾT */}
      <Modal
        title="CHI TIẾT YÊU CẦU TUYỂN DỤNG"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div className="jd-preview-content">
            <p>
              <b>Tiêu đề:</b> {selectedRecord.title}
            </p>
            <p>
              <b>Phòng ban:</b> {selectedRecord.department?.departmentName}
            </p>
            <p>
              <b>Vị trí:</b> {selectedRecord.position?.positionName}
            </p>
            <p>
              <b>Mô tả:</b>
            </p>
            <div
              className="quill-content-view"
              style={{ padding: 12, background: "#f5f5f5", borderRadius: 8 }}
              dangerouslySetInnerHTML={{ __html: selectedRecord.description }}
            />
          </div>
        )}
      </Modal>

      {/* MODAL CHỈNH SỬA */}
      <Modal
        title="CHỈNH SỬA THÔNG TIN TUYỂN DỤNG"
        open={isEditOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsEditOpen(false)}
        width={600}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="title"
            label="Tiêu đề tin"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Space size="large">
            <Form.Item
              name="vacancies"
              label="Số lượng"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              name="expiryDate"
              label="Hạn nộp hồ sơ"
              rules={[{ required: true }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Mô tả công việc (JD)">
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
