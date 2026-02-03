import { Col, Row } from "antd/es"
import "./style.scss"
import { Circle } from "./Circle"

export default function BusinessPhilosophy() {
  return (
    <Col>
      {/* "Triết lý kinh doanh" */}
      <Row>
        <h2 className="business__title mt-50">Triết lý kinh doanh</h2>
      </Row>
      <Row>
        <div className="statistics__grid">
          <Col className="business__box">
            <h2 className="business__box_number text-center">01</h2>
            <p className="business__box_text">
              Theo Đuổi Tăng Trưởng &amp; Phát Triển Bền Vững.
            </p>
          </Col>
          <Col className="business__box">
            <h2 className="business__box_number text-center">02</h2>
            <p className="business__box_text">
              Năng Suất Phải Là Nền Tảng Tăng Trưởng.
            </p>
          </Col>
          <Col className="business__box">
            <h2 className="business__box_number text-center">03</h2>
            <p className="business__box_text">
              Cung Cấp Dịch Vụ Chất Lượng Và Cao Cấp.
            </p>
          </Col>
        </div>
      </Row>
      {/* Ứng tuyển ngay */}
      <Row>
        <div className="frame mt-50">
          <div className="frame__content">
            <p className="frame__hero-text">
              Cùng chúng tôi <br />
              tạo ra những sản phẩm <br />
              <span className="frame__hero-text--bold">
                &lt;định hình tương lai/&gt;
              </span>
            </p>
            <Circle className="circle" />
          </div>
        </div>
      </Row>
    </Col>
  )
}
