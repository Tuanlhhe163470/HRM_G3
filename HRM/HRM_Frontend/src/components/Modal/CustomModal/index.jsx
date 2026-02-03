import { Modal } from "antd"
import PropTypes from "prop-types"
import "./style.scss"

function CustomModal({
  open = false,
  title = "",
  onOk = () => {},
  onCancel = () => {},
  footer = null,
  children,
  className = "", // nhận thêm className tùy chỉnh
  ...props
}) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      footer={footer}
      className={`custom-modal ${className}`}
      {...props}
    >
      <div>{children}</div>
    </Modal>
  )
}

CustomModal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
}

export default CustomModal
