import { Col, Row } from "antd/es"
import Image from "next/image"
import "./style.scss"
import human from "src/assets/images/icon/human.png"
import screen from "src/assets/images/icon/screen.png"
import star from "src/assets/images/icon/star.png"
import logo from "src/assets/images/logo/LOGO_H2Q_BIG_GRAY.png"

export default function Statistics() {
  return (
    <>
      {/* Hàng 1: 3 cột */}
      <Row className="statistics__container">
        <div className="statistics__grid">
          {/* Cột 1: "Những con số biết nói" */}
          <Col className="statistics__column">
            <div className="highlight">
              <h1 className="highlight__title">
                Những con số <br /> biết nói
              </h1>
              <div className="highlight__description">
                <p>
                  Chúng tôi tự hào về chất lượng công việc của mình và không ngừng
                  tìm kiếm những cách thức mới để cải thiện bí quyết &amp; năng lực
                  của mình.
                </p>
              </div>
            </div>
          </Col>

          {/* Cột 2: Các chỉ số */}
          <Col className="statistics__column statistics__box-container">
            <div className="statistics__box">
              <Image
                src={star}
                alt="star"
                width={50}
                height={50}
                className="statistics__box_icon"
              />
              <div className="statistics__box_content">
                <p className="statistics__box_content_text">
                  Chỉ số khách hàng hài lòng
                </p>
                <h2 className="statistics__box_title">9.8/10</h2>
              </div>
            </div>
            <div className="statistics__box">
              <Image
                src={human}
                alt="team"
                width={50}
                height={50}
                className="statistics__box_icon"
              />
              <div className="statistics__box_content">
                <p className="statistics__box_content_text">Số lượng nhân sự</p>
                <h2 className="statistics__box_title">50</h2>
              </div>
            </div>
            <div className="statistics__box">
              <Image
                src={screen}
                alt="project"
                width={50}
                height={50}
                className="statistics__box_icon"
              />
              <div className="statistics__box_content">
                <p className="statistics__box_content_text">Dự án thành công</p>
                <h2 className="statistics__box_title">200+</h2>
              </div>
            </div>
          </Col>

          {/* Cột 3: Logo */}
          <Col className="statistics__column">
            <div className="statistics__logo-box">
              <Image src={logo} alt="logo" />
            </div>
          </Col>
        </div>
      </Row>

      {/* Hàng 2: Phần tầm nhìn */}
      <Row>
        <div className="highlight highlight--vision">
          <Row>
            <div className="vision__title">Về tầm nhìn</div>
          </Row>
          <Row className="vision__content">
            <p>
              H2Q Solution mong muốn là nơi hội tụ của những tài năng có chung đam
              mê, khát vọng và tinh thần học hỏi trong mọi lĩnh vực khoa học và
              công nghệ. Đồng lòng, chúng ta sẽ vượt qua mọi trở ngại, đưa H2Q
              Solution trở thành công ty CNTT hàng đầu Việt Nam, ghi dấu chân trên
              bản đồ số thế giới.
            </p>
          </Row>
        </div>
      </Row>
    </>
  )
}
