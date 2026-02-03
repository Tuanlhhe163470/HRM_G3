import { Col, Row } from "antd/es"
import Image from "next/image"
import "./style.scss"
import image from "src/assets/images/Banner/banner-giai-phap.png"

export default function TitleSection() {
  return (
    <Row gutter={[32, 16]} className="title-section">
      <Col xs={24} md={12} className="title-section__text">
        <h1 className="title-section__heading">
          Chúng tôi xây dựng <br />
          <span className="title-section__heading--highlight">
            cầu nối giữa khách hàng và bạn
          </span>
        </h1>
      </Col>

      <Col xs={24} md={12} className="title-section__description">
        <div className="title-section__description-box">
          <p>
            Được thành lập vào năm 2021 bởi một nhóm chuyên gia CNTT có niềm đam
            mê lớn với công nghệ, công ty chúng tôi đã và đang cung cấp các giải
            pháp kỹ thuật tiên tiến, giúp khách hàng gỡ rối các vấn đề của họ.
          </p>
        </div>
      </Col>

      <div className="title-section__banner">
        <Image src={image} alt="Banner" fill />
      </div>
    </Row>
  )
}
