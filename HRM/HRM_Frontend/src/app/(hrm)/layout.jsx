"use client";
import { Layout } from "antd";
import Header from "@/components/Layout/Header/index.jsx";
import SidebarHRM from "@/components/Layout/Sidebar/index.jsx";

const { Content, Sider } = Layout;

export default function HRMLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Layout hasSider>
        <Sider
          width={260}
          theme="light"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 85,
            bottom: 0,
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <SidebarHRM />
        </Sider>

        <Layout style={{ marginLeft: 260 }}>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: "#fff",
              borderRadius: "8px",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
