"use client";

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";

const ContactModal = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    console.log("Contact Values:", values);
    // Giả lập gửi thông tin
    setTimeout(() => {
      setLoading(false);
      message.success(
        "Yêu cầu của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.",
      );
      form.resetFields();
      onCancel?.();
    }, 1500);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={450}
      styles={{
        body: { padding: "0px 24px" },
      }}
      className="custom-contact-modal"
    >
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-block w-fit">
          <h2 className="text-2xl font-bold text-gray-800 m-0 tracking-tight uppercase">
            Liên Hệ Tư Vấn
          </h2>
          <div className="w-full h-1 bg-[#00aeef] mt-1 rounded-full"></div>
        </div>

        <p className="text-gray-400 text-sm mt-3">
          Để lại thông tin, chúng tôi sẽ hỗ trợ bạn ngay lập tức
        </p>
      </div>

      <Form
        form={form}
        name="contact_form"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="fullname"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400 mr-2" />}
            placeholder="Họ và tên của bạn"
            className="rounded-md border-gray-200"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
            placeholder="Số điện thoại liên hệ"
            className="rounded-md border-gray-200"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không đúng định dạng!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 mr-2" />}
            placeholder="Email công việc"
            className="rounded-md border-gray-200"
          />
        </Form.Item>

        <Form.Item name="company">
          <Input
            prefix={<BankOutlined className="text-gray-400 mr-2" />}
            placeholder="Tên công ty / Tổ chức (không bắt buộc)"
            className="rounded-md border-gray-200"
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-[#00aeef] border-none h-12 rounded-md font-bold text-base hover:bg-[#0096ce] transition-all flex items-center justify-center gap-2"
          >
            GỬI YÊU CẦU NGAY
            <SendOutlined className="text-sm" />
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactModal;
