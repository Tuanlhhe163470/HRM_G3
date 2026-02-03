"use client"
import BusinessPhilosophy from "./component/BusinessPhilosophy"
import Statistics from "./component/Statistics"
import TitleSection from "./component/TitleSection"
export default function Page() {
  return (
    <div className=" max-w-7xl mx-auto" style={{ marginTop: "50px" }}>
      {/* Tiêu đề & mô tả */}
      <TitleSection />

      {/* Phần thống kê */}
      <Statistics />

      {/* Triết lý kinh doanh */}
      <BusinessPhilosophy />
    </div>
  )
}
