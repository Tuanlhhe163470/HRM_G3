import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "antd";
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons";
import JobCard from "@/components/Job/JobCard";

const jobs = [
  {
    title: "Lập trình viên Frontend (Senior)",
    company: "Tech Innovations Inc.",
    location: "TP. Hồ Chí Minh",
    type: "Toàn thời gian",
    posted: "22/05/2024",
  },
  {
    title: "Thiết kế UX/UI",
    company: "Creative Solutions",
    location: "Hà Nội",
    type: "Toàn thời gian",
    posted: "20/05/2024",
  },
  {
    title: "Chuyên gia Dữ liệu",
    company: "Quant Insights LLC",
    location: "Đà Nẵng (Hybrid)",
    type: "Toàn thời gian",
    posted: "18/05/2024",
  },
  {
    title: "Quản lý sản phẩm",
    company: "Global Software Corp.",
    location: "TP. Hồ Chí Minh",
    type: "Toàn thời gian",
    posted: "15/05/2024",
  },
  {
    title: "Kỹ sư DevOps",
    company: "Cloud Native Labs",
    location: "Hà Nội (Remote)",
    type: "Toàn thời gian",
    posted: "11/05/2024",
  },
  {
    title: "Chuyên viên Marketing",
    company: "BrandBoost Agency",
    location: "Cần Thơ",
    type: "Toàn thời gian",
    posted: "12/05/2024",
  },
];

export default function HomePage() {
  return (
    <div className="font-sans text-slate-900">
      {/* HERO SECTION */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
            Tương lai đang chờ đón: Tìm công việc mơ ước cùng{" "}
            <span className="text-[#00aeef]">HRM System</span>
          </h1>

          <p className="text-gray-500 mb-8 leading-relaxed max-w-2xl mx-auto">
            HRM System là nền tảng hàng đầu giúp kết nối tài năng với cơ hội. Dù
            bạn là người tìm việc hay doanh nghiệp đang xây dựng đội ngũ, chúng
            tôi đều có giải pháp cho bạn.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Input
              size="large"
              placeholder="Tìm kiếm việc làm, công ty hoặc từ khóa..."
              prefix={<SearchOutlined className="text-gray-400 mr-2" />}
              className="w-full border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#00aeef] transition-all shadow-sm hover:border-[#00aeef]"
              variant="borderless"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "9999px",
              }}
            />
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">
            Vị trí tuyển dụng nổi bật
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <JobCard key={idx} job={job} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/tim-kiem-viec">
              <Button className="h-11 px-10 rounded border-gray-200 text-gray-600 font-medium hover:border-[#00aeef] hover:text-[#00aeef] flex items-center justify-center mx-auto group">
                Xem tất cả công việc
                <ArrowRightOutlined className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DISCOVER SECTION */}
      <section className="py-20 border-t border-gray-50 bg-gray-50/30">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900 leading-tight">
              Khám phá cơ hội với danh sách việc làm toàn diện
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Trải nghiệm nguồn việc làm phong phú từ các công ty hàng đầu. Công
              cụ tìm kiếm trực quan và bộ lọc mạnh mẽ giúp lộ trình sự nghiệp
              của bạn đơn giản hơn bao giờ hết.
            </p>
            <Link href="/tim-kiem-viec">
              <Button className="h-11 px-8 rounded border-gray-200 text-gray-600 font-medium hover:border-[#00aeef] hover:text-[#00aeef] flex items-center justify-center group">
                Xem tất cả danh sách
                <ArrowRightOutlined className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/homepage-1.png"
              alt="Khám phá việc làm"
              width={500}
              height={350}
              className="rounded-lg shadow-sm object-cover"
            />
          </div>
        </div>
      </section>

      {/* HRM SYSTEM SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center order-2 md:order-1">
            <Image
              src="/images/homepage-2.png"
              alt="Hệ thống quản trị HRM"
              width={500}
              height={350}
              className="rounded-lg shadow-sm object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-3xl font-bold mb-6 text-gray-900 leading-tight">
              Tối ưu hóa tuyển dụng với hệ thống HRM nâng cao
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Đăng tin, theo dõi hồ sơ, quản lý ứng viên và thúc đẩy tăng trưởng
              — tất cả trên một nền tảng tích hợp được thiết kế để vận hành
              chính xác và hiệu quả.
            </p>
            <Link href="/lien-he">
              <Button className="h-11 px-8 rounded border-gray-200 text-gray-600 font-medium hover:border-[#00aeef] hover:text-[#00aeef] flex items-center justify-center group">
                Khám phá giải pháp HRM
                <ArrowRightOutlined className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
