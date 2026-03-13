"use client";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Space,
  InputNumber,
  Row,
  Col,
  Divider,
  Select,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { docSoVietNam } from "@/lib/stringsUtils";
import axiosClient from "@/lib/axiosClient"; 
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const [content, setContent] = useState("");
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Theo dõi giá trị lương để dịch thành chữ
  const salaryMinWatch = Form.useWatch("salaryMin", form);
  const salaryMaxWatch = Form.useWatch("salaryMax", form);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // 1. Lấy danh sách phòng ban và vị trí để hiển thị ô Select
        const [deptData, posData, allJobs] = await Promise.all([
          axiosClient.get("/Departments"),
          axiosClient.get("/Positions"),
          jobPostingService.getAll(),
        ]);

        setDepartments(deptData);
        setPositions(posData);

        // 2. Tìm tin tuyển dụng cụ thể
        const job = allJobs.find((item) => item.jobID === parseInt(id));
        if (job) {
          if (job.status === "Rejected") {
            notification.error({
              message: "Không thể chỉnh sửa tin đã bị từ chối!",
            });
            router.back();
            return;
          }

          // CHỈNH SỬA TẠI ĐÂY: Kiểm tra ngày hợp lệ trước khi gán
          const formattedExpiryDate = job.expiryDate
            ? dayjs(job.expiryDate)
            : null;

          form.setFieldsValue({
            ...job,
            // Đảm bảo truyền vào một đối tượng Dayjs hợp lệ hoặc null
            expiryDate:
              formattedExpiryDate && formattedExpiryDate.isValid()
                ? formattedExpiryDate
                : null,
          });

          setContent(job.description);
        }
      } catch (err) {
        notification.error({
          title: "Lỗi tải dữ liệu",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      // Gửi toàn bộ values (bao gồm Title, DeptID, PosID, Salary, ExpiryDate)
      await jobPostingService.update(id, {
        ...values,
        description: content,
        expiryDate: values.expiryDate.toISOString(),
      });

      notification.success({
        title: "Thành công",
        description: "Cập nhật tin tuyển dụng thành công!",
      });
      router.push("/recruitment/job-postings/list");
    } catch (err) {
      notification.error({
        title: "Thất bại",
        description: "Có lỗi xảy ra khi cập nhật!",
      });
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
        loading={loading}
        style={{ maxWidth: 1000, margin: "20px auto" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label={<b>Tiêu đề bài đăng</b>}
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentID"
                label={<b>Phòng ban</b>}
                rules={[{ required: true }]}
              >
                <Select size="large" placeholder="Chọn phòng ban">
                  {departments.map((d) => (
                    <Select.Option key={d.departmentID} value={d.departmentID}>
                      {d.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="positionID"
                label={<b>Vị trí ứng tuyển</b>}
                rules={[{ required: true }]}
              >
                <Select size="large" placeholder="Chọn vị trí">
                  {positions.map((p) => (
                    <Select.Option key={p.positionID} value={p.positionID}>
                      {p.positionName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label={<b>Hạn nộp hồ sơ</b>}
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  className="w-full"
                  size="large"
                  format="DD/MM/YYYY HH:mm"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vacancies"
                label={<b>Số lượng tuyển</b>}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} className="w-full" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider plain style={{ margin: "10px 0" }}>
            Mức lương (VNĐ)
          </Divider>

          <Row gutter={[0, 8]}>
            <Col span={24}>
              <Form.Item
                name="salaryMin"
                label={<b>Lương tối thiểu</b>}
                style={{ marginBottom: "12px" }}
                extra={
                  salaryMinWatch && (
                    <div className="mt-1 text-[#faad14] text-[12px] font-medium italic border-l-2 border-[#faad14] pl-2">
                      {docSoVietNam(salaryMinWatch)}
                    </div>
                  )
                }
              >
                <InputNumber
                  size="large"
                  className="w-full"
                  style={{ width: "100%", height: "45px", fontSize: "16px" }}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) event.preventDefault();
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="salaryMax"
                label={<b>Lương tối đa</b>}
                style={{ marginBottom: "12px" }}
                extra={
                  salaryMaxWatch && (
                    <div className="mt-1 text-[#faad14] text-[12px] font-medium italic border-l-2 border-[#faad14] pl-2">
                      {docSoVietNam(salaryMaxWatch)}
                    </div>
                  )
                }
              >
                <InputNumber
                  size="large"
                  className="w-full"
                  style={{ width: "100%", height: "45px", fontSize: "16px" }}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) event.preventDefault();
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<b>Mô tả chi tiết (JD)</b>}
            style={{ marginTop: 20 }}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{ height: 400, marginBottom: 50 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              backgroundColor: "#00aeef",
              height: "50px",
              fontWeight: "bold",
            }}
          >
            LƯU THAY ĐỔI
          </Button>
        </Form>
      </Card>
    </>
  );
}
