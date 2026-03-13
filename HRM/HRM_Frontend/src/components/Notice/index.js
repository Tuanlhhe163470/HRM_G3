"use client";

import { App } from "antd";
import { getMsgClient } from "src/lib/stringsUtils";
import SvgIcon from "../SvgIcon";
import "./styles.scss";

export default function useNotice() {
  const { notification } = App.useApp();

  const notice = ({ msg = "", desc, place, isSuccess = true }) => {
    const style = {
      background: isSuccess ? "#E5F5EB" : "#FCCED4",
    };

    notification.open({
      className: `notification-custom ${isSuccess ? "success" : "error"}`,
      style,
      placement: place || "bottomRight",
      title: (
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
    });
  };

  return notice;
}