export const downloadFromBase64 = (filename, base64) => {
  const element = document.createElement("a")
  element.setAttribute("href", "data:text/plain;base64," + base64)
  element.setAttribute("download", filename)

  element.style.display = "none"
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

export async function downloadFile(imageSrc, FileName) {
  const image = await fetch(imageSrc)
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)

  const link = document.createElement("a")
  link.href = imageURL
  link.download = FileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const downloadFromUrl = (uri, name) => {
  var link = document.createElement("a")
  link.download = name
  link.href = uri
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const downloadFileBlob = (data, name) => {
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", name)
  document.body.appendChild(link)
  link.click()
}

export const downloadPDF = (data, name) => {
  const linkSource = `data:application/pdf;base64,${data}`
  const downloadLink = document.createElement("a")
  const fileName = name
  downloadLink.href = linkSource
  downloadLink.download = fileName
  downloadLink.click()
}

// Hàm giải mã JWT hỗ trợ Tiếng Việt (Unicode)
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1]; // Lấy phần Payload của Token
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Giải mã kết hợp decodeURIComponent để xử lý ký tự UTF-8
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi giải mã Token Unicode:", error);
    return null;
  }
};