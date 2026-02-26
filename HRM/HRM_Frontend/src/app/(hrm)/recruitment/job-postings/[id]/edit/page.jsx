"use client";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input, Space } from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [content, setContent] = useState("");

  useEffect(() => {
    jobPostingService.getAll().then((res) => {
      const job = res.find((item) => item.jobID === parseInt(id));
      if (job) {
        if (job.status === "Rejected") {
          notification.error({
            message: "Không thể chỉnh sửa tin đã bị từ chối!",
          });
          router.back();
        }
        form.setFieldsValue({ ...job, expiryDate: dayjs(job.expiryDate) });
        setContent(job.description);
      }
    });
  }, [id]);

  const onFinish = async (values) => {
    try {
      await jobPostingService.update(id, { ...values, description: content });
      notification.success({ message: "Cập nhật thành công!" });
      router.push("/recruitment/job-postings/list");
    } catch (err) {
      notification.error({ message: "Lỗi cập nhật!" });
    }
  };

  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>
      </Space>
      <Card
        title="CHỈNH SỬA TIN TUYỂN DỤNG"
        style={{ maxWidth: 1000, margin: "20px auto" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả chi tiết">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{ height: 400, marginBottom: 50 }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
    </>
  );
}
