"use client"
import React from "react"
import { Form, Row, Col } from "antd"
import SvgIcon from "src/components/SvgIcon"
import ContactFormService from "src/services/ContactFormService"
import InputCustom from "src/components/MyInput/Input"
import TextAreaInputCustom from "src/components/MyInput/InputTextarea"
import Button from "src/components/MyButton/Button"
import notice from "src/components/Notice"

const ContactForm = () => {
  const [form] = Form.useForm()

  const handleSubmit = async values => {
    try {
      const response = await ContactFormService.submitContactForm(values)
      console.log("Form submitted successfully:", response)
      // Gọi notice với isSuccess: true để hiển thị thông báo thành công
      notice({ msg: "Gửi thông tin thành công!", isSuccess: true })
      form.resetFields()
    } catch (error) {
      console.error("Error submitting form:", error)
      // Gọi notice với isSuccess: false để hiển thị thông báo lỗi
      notice({ msg: "Có lỗi xảy ra, vui lòng thử lại sau!", isSuccess: false })
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="antd-contact-form"
    >
      <Row gutter={[32, 24]}>
        <Col xs={24} md={12}>
          <Form.Item label="Họ và tên" name="fullName">
            <InputCustom placeholder="Nhập họ và tên" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Địa chỉ email" name="email">
            <InputCustom placeholder="Nhập email" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <InputCustom placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Công ty" name="company">
            <InputCustom placeholder="Nhập tên công ty" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Lời nhắn" name="message">
        <TextAreaInputCustom placeholder="Nhập lời nhắn ở đây..." rows={6} />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        <span>Gửi thông tin ngay</span>
        <SvgIcon name="arrow_right_contact" />
      </Button>
    </Form>
  )
}

export default ContactForm

