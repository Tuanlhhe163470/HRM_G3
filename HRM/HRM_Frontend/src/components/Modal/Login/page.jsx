import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Checkbox, Divider, Form, Input, Space, Typography } from "antd"
import CustomModal from "src/components/Modal/CustomModal"
import "./style.scss"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { loginStart, loginSuccess, loginFailure } from "src/redux/slices/AuthSlice"

const { Text, Link } = Typography

const LoginPage = ({ onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const handleLogin = async values => {
    try {
      dispatch(loginStart())
      //API
      dispatch(
        loginSuccess({
          user: response.user,
          userInfo: response.userInfo,
        }),
      )

      onCancel?.()
      setLoading(true)
    } catch (error) {
      dispatch(loginFailure(error.message))
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomModal
      open={true}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={500}
    >
      <div className="login-modal">
        <Typography.Title level={3} className="login-modal__title">
          Đăng nhập
        </Typography.Title>

        <Form
          form={form}
          name="login_form"
          className="login-modal__form"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item className="login-modal__options">
            <div className="login-modal__remember-forgot">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Duy trì đăng nhập</Checkbox>
              </Form.Item>
              <Link className="login-modal__forgot-link">Quên mật khẩu ?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-modal__button"
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain />

          <div className="login-modal__register">
            <Space>
              <Text type="secondary">Bạn chưa có tài khoản?</Text>
              <Link strong>Đăng ký</Link>
            </Space>
          </div>
        </Form>
      </div>
    </CustomModal>
  )
}

export default LoginPage
