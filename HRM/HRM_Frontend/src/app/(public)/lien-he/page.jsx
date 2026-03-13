"use client";

import React from "react";
import { Form, Input, Button, message, Breadcrumb } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  RocketOutlined,
  HeartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default function AboutAndContactPage() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Contact form values:", values);
    message.success(
      "Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm nhất.",
    );
    form.resetFields();
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Breadcrumb
          items={[
            {
              title: (
                <Link href="/" className="text-gray-400">
                  Trang chủ
                </Link>
              ),
            },
            {
              title: (
                <span className="font-bold text-[#00aeef]">Về chúng tôi</span>
              ),
            },
          ]}
        />
      </div>
      {/* 1. HERO SECTION */}
      <section className="bg-gray-50/50 py-20 border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block w-fit mb-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 uppercase">
              Về chúng tôi
            </h1>
            <div className="w-full h-1 bg-[#00aeef] mt-2 rounded-full"></div>
          </div>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
            Chúng tôi là đội ngũ tiên phong trong việc cung cấp các giải pháp
            quản trị nhân sự số hóa, giúp doanh nghiệp tối ưu hóa nguồn lực và
            bứt phá trong kỷ nguyên công nghệ.
          </p>
        </div>
      </section>

      {/* 2. MISSION & VALUES SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00aeef] text-2xl">
                <RocketOutlined />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Sứ mệnh</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Đồng hành cùng doanh nghiệp Việt trong hành trình chuyển đổi số
                quản trị con người.
              </p>
            </div>

            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00aeef] text-2xl">
                <HeartOutlined />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Giá trị</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Đặt con người làm trung tâm, lấy sự chính xác và hiệu quả làm
                thước đo thành công.
              </p>
            </div>

            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00aeef] text-2xl">
                <TeamOutlined />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Đội ngũ</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Có các chuyên gia giàu kinh nghiệm trong lĩnh vực công nghệ và
                quản trị HR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTACT & FORM SECTION */}
      <section className="bg-gray-50/30 py-20 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kết nối với chúng tôi
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Dù bạn có thắc mắc về giải pháp hay muốn đăng ký trải nghiệm thử,
              đội ngũ tư vấn luôn sẵn sàng phản hồi trong vòng 24h.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Thông tin liên hệ */}
            <div className="space-y-10">
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#00aeef] transition-all duration-300 shadow-sm">
                  <MailOutlined className="text-[#00aeef] text-xl group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Email hỗ trợ
                  </p>
                  <p className="text-gray-800 font-medium">
                    contact@hrmsystem.vn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#00aeef] transition-all duration-300 shadow-sm">
                  <PhoneOutlined className="text-[#00aeef] text-xl group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Hotline
                  </p>
                  <p className="text-gray-800 font-medium">090x xxx xxx</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#00aeef] transition-all duration-300 shadow-sm">
                  <EnvironmentOutlined className="text-[#00aeef] text-xl group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Văn phòng
                  </p>
                  <p className="text-gray-800 font-medium">
                    Khu Công nghệ cao Hòa Lạc, Hà Nội
                  </p>
                </div>
              </div>
            </div>

            {/* Form liên hệ */}
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-blue-500/5">
              <h3 className="text-xl font-bold text-gray-800 mb-8 text-center uppercase tracking-wide">
                Gửi yêu cầu tư vấn
              </h3>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <Form.Item
                  name="fullname"
                  label={
                    <span className="font-medium text-gray-600">Họ và tên</span>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input placeholder="Nguyễn Văn A" className="rounded-md" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={
                    <span className="font-medium text-gray-600">Email</span>
                  }
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Email không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    placeholder="email@company.com"
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label={
                    <span className="font-medium text-gray-600">
                      Nội dung thắc mắc
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung!" },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Hãy để lại lời nhắn..."
                    className="rounded-md"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="bg-[#00aeef] border-none h-12 rounded-md font-bold text-base hover:bg-[#0096ce] transition-all flex items-center justify-center gap-2"
                >
                  GỬI TIN NHẮN <SendOutlined />
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
