"use client";

import React from "react";
import {
  UserAddOutlined,
  SolutionOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  LineChartOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";


const hrmModules = [
  {
    title: "Tuyển dụng & Hội nhập",
    desc: "Tối ưu hóa quy trình từ tìm kiếm ứng viên đến đón tiếp nhân sự mới một cách liền mạch. Thu hút tài năng và tích hợp nhân viên mới hiệu quả.",
    icon: <UserAddOutlined className="text-3xl text-[#00aeef]" />,
  },
  {
    title: "Quản trị Nhân sự Cốt lõi",
    desc: "Quản lý dữ liệu nhân viên, cấu trúc tổ chức và các chức năng nhân sự thiết yếu trên nền tảng tập trung, bảo mật và dễ sử dụng.",
    icon: <SolutionOutlined className="text-3xl text-[#00aeef]" />,
  },
  {
    title: "Theo dõi Thời gian & Chấm công",
    desc: "Theo dõi chính xác giờ làm việc, quản lý yêu cầu nghỉ phép và đảm bảo tuân thủ luật lao động. Tối ưu hóa kế hoạch nguồn nhân lực.",
    icon: <FieldTimeOutlined className="text-3xl text-[#00aeef]" />,
  },
  {
    title: "Lương & Phúc lợi",
    desc: "Quản lý bảng lương, các gói phúc lợi và đảm bảo các chính sách đãi ngộ công bằng. Cung cấp sự minh bạch về thù lao cho nhân viên.",
    icon: <DollarOutlined className="text-3xl text-[#00aeef]" />,
  },
  {
    title: "Hiệu suất & Đào tạo",
    desc: "Thúc đẩy tăng trưởng với các kỳ đánh giá, thiết lập mục tiêu và các tính năng đào tạo toàn diện. Phát triển kỹ năng và lộ trình nghề nghiệp.",
    icon: <LineChartOutlined className="text-3xl text-[#00aeef]" />,
  },
];

export default function HRMOverviewPage() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Yêu cầu nhận được:", values);
    message.success("Cảm ơn bạn! Yêu cầu của bạn đã được gửi thành công.");
    form.resetFields();
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* 1. Header Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block w-fit mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 m-0 tracking-tight leading-tight uppercase">
              Tổng quan Hệ thống HRM
            </h1>
            <div className="w-full h-1 bg-[#00aeef] mt-2 rounded-full"></div>
          </div>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed mt-4">
            Chuyển đổi cách quản trị nguồn nhân lực với hệ thống HRM toàn diện.
            Từ tuyển dụng đến khi nghỉ hưu, tối ưu hóa mọi khía cạnh của vòng
            đời nhân viên với các công cụ trực quan.
          </p>
        </div>
      </section>

      {/* 2. Key Modules Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-800 uppercase tracking-wide">
            Các tính năng Chính Của Hệ Thống HRM
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {hrmModules.slice(0, 4).map((module, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#00aeef] transition-colors">
                  <span className="group-hover:text-white transition-colors">
                    {module.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {module.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {module.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group max-w-lg">
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#00aeef] transition-colors mx-auto">
                <span className="group-hover:text-white transition-colors">
                  {hrmModules[4].icon}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">
                {hrmModules[4].title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed text-center">
                {hrmModules[4].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contact Form Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
              Liên hệ ngay
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Liên hệ với chúng tôi ngay để trải nghiệm demo 
              về cách hệ thống có thể tối ưu hóa vận hành cho tổ chức của bạn.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-2xl shadow-blue-500/5">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <div className="grid md:grid-cols-2 gap-x-8">
                <Form.Item
                  name="name"
                  label={
                    <span className="font-semibold text-gray-600">
                      Họ và Tên
                    </span>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="John Doe" className="rounded-md" />
                </Form.Item>
                <Form.Item
                  name="company"
                  label={
                    <span className="font-semibold text-gray-600">Công ty</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên công ty" },
                  ]}
                >
                  <Input placeholder="Acme Corp." className="rounded-md" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={
                    <span className="font-semibold text-gray-600">Email</span>
                  }
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Email không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    placeholder="john.doe@example.com"
                    className="rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label={
                    <span className="font-semibold text-gray-600">
                      Số điện thoại
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input
                    placeholder="+1 (555) 123-4567"
                    className="rounded-md"
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="message"
                label={
                  <span className="font-semibold text-gray-600">Lời nhắn</span>
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Hãy cho chúng tôi biết nhu cầu của bạn..."
                  className="rounded-md"
                />
              </Form.Item>
              <Form.Item className="mb-0 mt-6 text-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-[#00aeef] border-none h-14 px-12 rounded-lg font-bold text-lg hover:bg-[#0096ce] shadow-lg transition-all flex items-center justify-center mx-auto gap-2"
                >
                  GỬI YÊU CẦU <SendOutlined />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
