"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography, Modal } from "antd";
import { useState } from "react";
import { loginApi } from "@/services/AuthService";
import { useRouter } from "next/navigation";
import useNotice from "@/components/Notice";
import Cookies from "js-cookie";

const { Link } = Typography;

const LoginModal = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notice = useNotice();
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await loginApi(values);
      if (response && response.token) {
        const authData = response.token;

        // 1. lưu localStorage
        localStorage.setItem("token", authData.token);
        localStorage.setItem("user", JSON.stringify(authData.employee));

        // 2. LƯU VÀO COOKIE ĐỂ MIDDLEWARE ĐỌC ĐƯỢC
        // Lưu token và roleName, set hạn 1 ngày
        Cookies.set("token", authData.token, { expires: 1 });
        Cookies.set("role", authData.employee.roleName, { expires: 1 });

        notice({ msg: "Đăng nhập thành công!", isSuccess: true });
        onCancel?.();

        router.push("/attendance/checkin");

        router.refresh();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;

      notice({
        msg: "Đăng nhập thất bại",
        desc: errorMsg || "Tài khoản hoặc mật khẩu không chính xác!",
        isSuccess: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      styles={{
        body: { padding: "0px 24px" },
      }}
      className="custom-login-modal"
    >
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-block w-fit pt-6">
          <h2 className="text-2xl font-bold text-gray-800 m-0 tracking-tight uppercase">
            Đăng nhập
          </h2>
          <div className="w-full h-1 bg-[#00aeef] mt-1 rounded-full"></div>
        </div>

        <p className="text-gray-400 text-sm mt-3">
          Truy cập vào hệ thống HRM của bạn
        </p>
      </div>

      <Form
        form={form}
        name="login_form"
        onFinish={handleLogin}
        layout="vertical"
        size="large"
        requiredMark={false}
        className="w-full pb-6"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400 mr-2" />}
            placeholder="Tên đăng nhập"
            className="rounded-md border-gray-200 hover:border-[#00aeef]"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          className="mb-2"
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400 mr-2" />}
            placeholder="Mật khẩu"
            className="rounded-md border-gray-200 hover:border-[#00aeef]"
          />
        </Form.Item>

        <div className="flex justify-end mb-6">
          <Link className="text-[#00aeef] text-sm hover:text-[#0096ce] font-medium">
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-[#00aeef] border-none h-11 rounded-md font-bold text-base hover:bg-[#0096ce] shadow-sm"
          >
            ĐĂNG NHẬP
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;
