"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, Typography, Form, Input, InputNumber, 
  DatePicker, Button, Space, Divider, App, Row, Col, Spin , Tag
} from "antd";
import { 
  ArrowLeftOutlined, 
  SendOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  UserOutlined 
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import candidateService from "@/services/Recruitment/candidateService";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function CreateOfferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const candidateId = searchParams.get("candidateId");

  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (candidateId) {
      const loadCandidate = async () => {
        setLoading(true);
        try {
          const data = await candidateService.getById(candidateId);
          setCandidate(data);
          // Pre-fill một số thông tin nếu cần
        } catch (error) {
          notification.error({ message: "Lỗi", description: "Không tìm thấy ứng viên." });
        } finally {
          setLoading(false);
        }
      };
      loadCandidate();
    }
  }, [candidateId]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Logic gửi Offer: Gọi API lưu thông tin Offer và gửi Email
      // await candidateService.sendOffer(candidateId, values);
      
      notification.success({
        message: "Thành công",
        description: `Đã gửi thư mời làm việc cho ứng viên ${candidate.fullName}`,
      });
      router.push("/recruitment/candidates"); // Quay lại danh sách
    } catch (error) {
      notification.error({ message: "Lỗi", description: "Không thể gửi Offer." });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !candidate) return <div className="p-20 text-center"><Spin size="large" /></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          className="p-0 text-slate-500 w-fit"
          onClick={() => router.back()}
        >
          Quay lại danh sách
        </Button>

        <div className="flex justify-between items-center">
          <Title level={2} className="m-0 text-[#154398] font-black uppercase">
            Thiết lập Thư mời làm việc (OFFER)
          </Title>
        </div>

        <Row gutter={24}>
          {/* Thông tin ứng viên (Read-only) */}
          <Col span={8}>
            <Card className="rounded-2xl border-none shadow-sm sticky top-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserOutlined className="text-3xl text-blue-500" />
                </div>
                <Title level={4} className="m-0">{candidate?.fullName}</Title>
                <Text type="secondary">{candidate?.jobTitle}</Text>
              </div>
              <Divider className="my-3" />
              <div className="space-y-2">
                <div><Text type="secondary" className="text-[11px] block">EMAIL</Text><Text strong>{candidate?.email}</Text></div>
                <div><Text type="secondary" className="text-[11px] block">ĐIỂM PHỎNG VẤN</Text><Tag color="blue" className="font-bold">{candidate?.score}/10</Tag></div>
              </div>
            </Card>
          </Col>

          {/* Form nhập Offer */}
          <Col span={16}>
            <Card className="rounded-2xl border-none shadow-sm p-4">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Title level={5} className="text-[#154398] mb-4">Thông tin lương & Phúc lợi</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label={<span className="font-bold">Lương cơ bản (Gross)</span>} 
                      name="basicSalary"
                      rules={[{ required: true, message: 'Vui lòng nhập lương' }]}
                    >
                      <InputNumber 
                        className="w-full h-11 rounded-xl pt-1" 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label={<span className="font-bold">Ngày dự kiến nhận việc</span>} 
                      name="joinDate"
                      rules={[{ required: true }]}
                    >
                      <DatePicker className="w-full h-11 rounded-xl" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label={<span className="font-bold">Phụ cấp & Thưởng</span>} name="allowance">
                  <Input.TextArea rows={3} className="rounded-xl" placeholder="Ăn trưa, xăng xe, hoa hồng..." />
                </Form.Item>

                <Divider />
                
                <Title level={5} className="text-[#154398] mb-4">Ghi chú cho ứng viên</Title>
                <Form.Item name="note">
                  <Input.TextArea rows={4} className="rounded-xl" placeholder="Lời nhắn gửi từ Ban Tuyển dụng..." />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-8">
                  <Button className="h-12 px-8 rounded-xl font-bold" onClick={() => router.back()}>Hủy bỏ</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="h-12 px-10 rounded-xl bg-[#154398] font-bold"
                    icon={<SendOutlined />}
                    loading={loading}
                  >
                    Gửi Offer chính thức
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}