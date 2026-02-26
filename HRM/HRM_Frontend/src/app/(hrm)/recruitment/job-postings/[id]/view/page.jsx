"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Button,
  Typography,
  Tag,
  Divider,
  Space,
  Spin,
  App,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  RocketOutlined,
  StopOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import { docSoVietNam } from "@/lib/stringsUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ViewJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { modal, notification } = App.useApp();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const res = await jobPostingService.getAll();
      const found = res.find((item) => item.jobID === parseInt(id));
      setJob(found);
    } catch (error) {
      notification.error({
        title: "Lỗi hệ thống",
        description: "Không thể tải chi tiết tin",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetail();
  }, [id]);
  const renderSalary = () => {
    const min = job?.salaryMin;
    const max = job?.salaryMax;

    if (min && max) {
      return {
        text: `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`,
        words: `${docSoVietNam(min)} - ${docSoVietNam(max)}`,
      };
    }
    if (min) {
      return {
        text: `Lương tối thiểu: ${min.toLocaleString()} VNĐ`,
        words: docSoVietNam(min),
      };
    }
    if (max) {
      return {
        text: `Lương tối đa: ${max.toLocaleString()} VNĐ`,
        words: docSoVietNam(max),
      };
    }
    return { text: "Thỏa thuận", words: "" };
  };

  const salaryInfo = renderSalary();
  // Thao tác: Publish
  const handlePublish = async () => {
    try {
      await jobPostingService.publish(job.jobID, job.description);
      notification.success({
        title: "Thành công",
        description: "Tin đã được đăng công khai",
      });
      fetchJobDetail();
    } catch (err) {
      notification.error({ title: "Lỗi", description: "Không thể đăng tin" });
    }
  };

  // Thao tác: Close
  const handleClose = async () => {
    try {
      await jobPostingService.close(job.jobID);
      notification.success({
        title: "Thành công",
        description: "Đã đóng tin tuyển dụng",
      });
      fetchJobDetail();
    } catch (err) {
      notification.error({ title: "Lỗi", description: "Thao tác thất bại" });
    }
  };

  // Thao tác: Reopen với DatePicker
  const handleReopen = () => {
    let selectedDate = dayjs().add(30, "day");
    modal.confirm({
      title: "GIA HẠN & MỞ LẠI TIN TUYỂN DỤNG",
      content: (
        <div style={{ marginTop: 20 }}>
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
      onOk: async () => {
        try {
          await jobPostingService.reopen(job.jobID, selectedDate.toISOString());
          notification.success({
            title: "Thành công",
            description: "Đã mở lại tin và gia hạn",
          });
          fetchJobDetail();
        } catch (err) {
          notification.error({
            title: "Lỗi",
            description: "Không thể mở lại tin",
          });
        }
      },
    });
  };

  if (loading || !job)
    return (
      <Spin
        size="large"
        style={{ display: "flex", justifyContent: "center", marginTop: 100 }}
      />
    );

  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>
      </Space>

      <Card
        variant="borderless"
        style={{ maxWidth: 1000, margin: "20px auto" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Title level={2}>{job.title.toUpperCase()}</Title>
          <Tag
            color={
              job.status === "Approved"
                ? "green"
                : job.status === "Open"
                  ? "cyan"
                  : "volcano"
            }
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {job.status.toUpperCase()}
          </Tag>
        </div>

        <Space size="large" style={{ marginBottom: 16 }}>
          <Text>
            <b>Phòng ban:</b> {job.department?.departmentName}
          </Text>
          <Text>
            <b>Vị trí:</b> {job.position?.positionName}
          </Text>
          <Text>
            <b>Hạn nộp:</b> {dayjs(job.expiryDate).format("DD/MM/YYYY")}
          </Text>
          <div
            style={{
              padding: "10px 14px",
              background: "#f0f5ff",
              borderRadius: "8px",
              border: "1px solid #d6e4ff",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <DollarCircleOutlined style={{ fontSize: 16, color: "#2f54eb" }} />

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d39c4",
                }}
              >
                {salaryInfo.text}
              </div>

              {salaryInfo.words && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#8c8c8c",
                    fontStyle: "italic",
                    marginTop: 2,
                  }}
                >
                  {salaryInfo.words}
                </div>
              )}
            </div>
          </div>
        </Space>

        <Divider titlePlacement="left">NỘI DUNG MÔ TẢ CÔNG VIỆC (JD)</Divider>

        <div
          className="html-content-render"
          style={{
            padding: "20px",
            background: "#fcfcfc",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            lineHeight: "1.8",
            minHeight: "300px",
          }}
          dangerouslySetInnerHTML={{ __html: job.description }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "32px",
            gap: "12px",
          }}
        >
          {/* Nút Chỉnh sửa: Ẩn nếu Rejected hoặc Closed */}
          {job.status !== "Rejected" && job.status !== "Closed" && (
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/recruitment/job-postings/${id}/edit`)
              }
            >
              Chỉnh sửa JD
            </Button>
          )}

          {/* Nút Publish: Hiện nếu Approved */}
          {job.status === "Approved" && (
            <Button
              type="primary"
              icon={<RocketOutlined />}
              style={{ backgroundColor: "#13c2c2" }}
              onClick={handlePublish}
            >
              Đăng tin công khai
            </Button>
          )}

          {/* Nút Close: Hiện nếu đang Open */}
          {job.status === "Open" && (
            <Button danger icon={<StopOutlined />} onClick={handleClose}>
              Đóng tin đăng
            </Button>
          )}

          {/* Nút Reopen: Hiện nếu đã Closed */}
          {job.status === "Closed" && (
            <Button
              icon={<ReloadOutlined />}
              style={{ color: "#722ed1", borderColor: "#722ed1" }}
              onClick={handleReopen}
            >
              Gia hạn & Mở lại
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
