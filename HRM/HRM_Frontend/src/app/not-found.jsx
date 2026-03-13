import { Result } from "antd"
import Link from "next/link"

function NotFound() {
  return (
    <div className="d-flex-center" style={{ width: "100%" }}>
      <Result
        status="404"
        title="404 NotFound"
        subTitle="Xin lỗi, Trang web bạn đang tìm kiếm không tồn tại."
        extra={
          <Link href="/">Return Home</Link>
        }
      />
    </div>
  )
}
export default NotFound
