import { Layout } from "antd"
import React, { useState } from "react"
import AccessMenu from "./components/AccessMenu"

const { Sider } = Layout

const siderStyle = {
  //   textAlign: "center",
  //   lineHeight: "120px",
  backgroundColor: "#fff",
}
const MenuLeft = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Sider
      style={siderStyle}
      width={"300px"}
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
    >
      <AccessMenu />
    </Sider>
  )
}

export default MenuLeft
