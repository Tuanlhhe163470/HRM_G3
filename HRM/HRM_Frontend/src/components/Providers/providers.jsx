"use client"

import { ConfigProvider } from "antd"
import { Provider } from "react-redux"

import StoreProvider from "src/contexts"
import { store } from "src/redux/store"
import theme from "src/theme/ThemeConfig"

const Providers = ({ children }) => {
  return (
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <StoreProvider>{children}</StoreProvider>
      </Provider>
    </ConfigProvider>
  )
}
export default Providers
