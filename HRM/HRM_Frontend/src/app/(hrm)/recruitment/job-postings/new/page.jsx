"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
  App,
  InputNumber,
  Space,
  Divider,
} from "antd";
import {
  SaveOutlined,
  FormOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import dayjs from "dayjs";
import styles from "./CreateJobRequisition.module.scss";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import useNotice from "@/components/Notice";
import { docSoVietNam } from "@/lib/stringsUtils";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateJobRequisition() {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notice = useNotice();
  const salaryMinWatch = Form.useWatch("salaryMin", form);
  const salaryMaxWatch = Form.useWatch("salaryMax", form);
  // Cấu hình thanh công cụ cho Editor
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptData, posData] = await Promise.all([
          axiosClient.get("/Departments"),
          axiosClient.get("/Positions"),
        ]);
        setDepartments(deptData);
        setPositions(posData);
      } catch (err) {
        notice({
          msg: "Lỗi hệ thống",
          desc: err.message,
          isSuccess: false,
        });
      }
    };
    loadData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        hiredCount: 0,
        expiryDate: values.expiryDate.toISOString(),
        createdBy: parseInt(localStorage.getItem("userId")),
        // Backend sẽ nhận thêm salaryMin và salaryMax từ values
      };
      await jobPostingService.create(payload);
      notice({
        msg: "Tạo thành công",
        desc: "Tin tuyển dụng đã được gửi phê duyệt",
        isSuccess: true,
      });
      form.resetFields();
      form.setFieldsValue({ description: "" });
    } catch (error) {
      notice({
        msg: "Lỗi hệ thống",
        desc: error.message,
        isSuccess: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleSection}>
        <Title level={2}>
          <FormOutlined /> TẠO MỚI TIN TUYỂN DỤNG
        </Title>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.formContainer}
      >
        <Row gutter={24}>
          {/* Cột trái: Nội dung chính */}
          <Col span={16}>
            <Form.Item
              name="title"
              label={<b>Tiêu đề bài đăng</b>}
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              getValueFromEvent={(e) => e.target.value.toUpperCase()}
            >
              <Input
                placeholder="VÍ DỤ: TUYỂN KỸ SƯ CẦU NỐI"
                size="large"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<b>Nội dung mô tả (JD)</b>}
              rules={[
                { required: true, message: "Vui lòng nhập nội dung mô tả!" },
              ]}
            >
              <ReactQuill
                theme="snow"
                modules={modules}
                placeholder="Nhập mô tả công việc, yêu cầu, quyền lợi..."
                style={{ height: "500px", marginBottom: "50px" }}
              />
            </Form.Item>
          </Col>

          {/* Cột phải: Cấu hình */}
          <Col span={8}>
            <div className={styles.sidePanel}>
              <Form.Item
                name="departmentID"
                label="Phòng ban"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn phòng ban" size="large">
                  {departments.map((d) => (
                    <Select.Option key={d.departmentID} value={d.departmentID}>
                      {d.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="positionID"
                label="Vị trí ứng tuyển"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn vị trí" size="large">
                  {positions.map((p) => (
                    <Select.Option key={p.positionID} value={p.positionID}>
                      {p.positionName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Divider plain>Mức lương (VNĐ)</Divider>

              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="salaryMin"
                    label={<b>LƯƠNG TỐI THIỂU</b>}
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
                      style={{
                        width: "100%",
                        height: "40px",
                        fontSize: "15px",
                        borderRadius: "6px",
                      }}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Nhập mức lương tối thiểu"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="salaryMax"
                    label={<b>LƯƠNG TỐI ĐA</b>}
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
                      style={{
                        width: "100%",
                        height: "40px",
                        fontSize: "15px",
                        borderRadius: "6px",
                      }}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Nhập mức lương tối đa"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="vacancies"
                    label="Số lượng"
                    rules={[{ required: true }]}
                    initialValue={1}
                  >
                    <InputNumber min={1} className="w-full" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="expiryDate"
                    label="Hạn cuối"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      showTime
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                      className="w-full"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className={styles.infoAlert}>
                <Space align="start">
                  <InfoCircleOutlined style={{ color: "#00aeef" }} />
                  <Text italic>
                    Thông tin sau khi tạo sẽ được gửi tới cấp quản lý phê duyệt.
                  </Text>
                </Space>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                block
                size="large"
                className={styles.submitBtn}
              >
                GỬI PHÊ DUYỆT
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
