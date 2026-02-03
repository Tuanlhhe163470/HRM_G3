/* eslint-disable react/no-danger */
import { notification } from "antd"
import { getMsgClient } from "src/lib/stringsUtils"
import SvgIcon from "../SvgIcon"
import "./styles.scss"

export default function notice({ msg = "", desc, place, isSuccess = true }) {
  const style = {
    background: isSuccess ? "#E5F5EB" : "#FCCED4",
  }

  notification.open({
    className: `notification-custom ${isSuccess ? "success" : "error"}`,
    style,
    placement: place || "bottomRight",
    message: (
      <div
        dangerouslySetInnerHTML={{
          __html: getMsgClient(msg || ""),
        }}
      />
    ),
    description: (
      <div
        dangerouslySetInnerHTML={{
          __html: getMsgClient(desc || ""),
        }}
      />
    ),
    icon: isSuccess ? (
      <SvgIcon name="notice-success" />
    ) : (
      <SvgIcon name="notice-error" />
    ),
    duration: 3,
  })
}
