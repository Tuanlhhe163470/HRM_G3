"use client"
import React from "react"
import SvgIcon from "src/components/SvgIcon"

const ContactInfo = () => {
  return (
    <div className="contact_info">
      <h3 className="contact_info__heading">
        Điền thông tin hoặc liên lạc với chúng tôi ngay!
      </h3>
      <p className="contact_info__detail">
        Đội ngũ của chúng tôi sẵn sàng lắng nghe và tư vấn những giải pháp thích
        hợp với doanh nghiệp bạn.
      </p>
      <div className="contact_info__methods">
        <div className="contact_info__method">
          <SvgIcon name="logo_mail_contact" />
          <div className="contact_info__option">
            <span className="contact_info__label">Email</span>
            <a
              href="mailto:caominhhau89@gmail.com"
              className="contact_info__value"
            >
              caominhhau89@gmail.com
            </a>
          </div>
        </div>
        <div className="contact_info__method">
          <SvgIcon name="logo_phone_contact" />
          <div className="contact_info__option">
            <span className="contact_info__label">Phone:</span>
            <a href="tel:0968938898" className="contact_info__value">
              0968938898
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo

