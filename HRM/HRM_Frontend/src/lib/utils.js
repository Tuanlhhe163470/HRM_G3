import { forEach, isArray } from "lodash"

export const trimData = data => {
  if (!data) return data
  const tempData = isArray(data) ? [] : {}
  forEach(data, (val, keyName) => {
    if (typeof val === "string") tempData[keyName] = val.trim()
    else if (typeof val === "object") tempData[keyName] = trimData(val)
    else tempData[keyName] = val
  })
  return tempData
}

export const parseJwt = token => {
  try {
    const base64Url = token.split(".")[1] // Lấy phần payload của JWT
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/") // Chuyển Base64-URL về Base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload) // Chuyển chuỗi JSON thành object
  } catch (e) {
    console.error("Token không hợp lệ:", e)
    return null
  }
}
