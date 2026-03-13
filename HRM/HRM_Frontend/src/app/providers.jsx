"use client";

import { ConfigProvider, App } from "antd";

export default function Providers({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff", 
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}