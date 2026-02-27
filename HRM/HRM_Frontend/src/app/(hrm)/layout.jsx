"use client";
import { Layout } from "antd";
import Header from "@/components/Layout/Header/index.jsx";
import SidebarHRM from "@/components/Layout/Sidebar/index.jsx";

const { Content, Sider } = Layout;

export default function HRMLayout({ children }) {
  const headerHeight = 85; 
  const siderWidth = 260;

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}> 
      <div style={{ height: headerHeight, zIndex: 1001 }}>
        <Header />
      </div>

      <Layout hasSider style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        {/* 2. Sider cố định hoàn toàn */}
        <Sider
          width={siderWidth}
          theme="light"
          style={{
            position: "fixed",
            left: 0,
            top: headerHeight,
            bottom: 0,
            borderRight: "1px solid #f0f0f0",
            backgroundColor: "#fff",
            zIndex: 10,
          }}
        >
          <SidebarHRM />
        </Sider>

        {/* 3. Phần Content có thanh cuộn riêng */}
        <Layout 
          style={{ 
            marginLeft: siderWidth, 
            height: "100%", 
            overflowY: "auto", 
            backgroundColor: "#f5f5f5" 
          }}
        >
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: "#fff",
              borderRadius: "8px",
              minHeight: "fit-content", 
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
