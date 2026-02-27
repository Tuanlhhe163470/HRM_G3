"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, Spin, Empty } from "antd";
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons";
import JobCard from "@/components/Job/JobCard";
import jobPostingService from "@/services/Recruitment/jobPostingService";

export default function HomePage() {
  const [publishedJobs, setPublishedJobs] = useState([]); // Dữ liệu gốc từ API
  const [filteredJobs, setFilteredJobs] = useState([]);   // Dữ liệu sau khi lọc
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");      // State cho ô tìm kiếm

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobPostingService.getPublished();
      setPublishedJobs(res);
      setFilteredJobs(res.slice(0, 6)); // Mặc định hiển thị 6 tin mới nhất
    } catch (error) {
      console.error("Lỗi tải tin tuyển dụng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Xử lý lọc dữ liệu khi searchTerm thay đổi
  useEffect(() => {
    const results = publishedJobs.filter((job) => {
      const searchContent = `${job.title} ${job.department?.departmentName} ${job.position?.positionName}`.toLowerCase();
      return searchContent.includes(searchTerm.toLowerCase());
    });
    
    // Nếu không có từ khóa thì hiện 6 tin, nếu có thì hiện theo kết quả tìm kiếm
    setFilteredJobs(searchTerm ? results : publishedJobs.slice(0, 6));
  }, [searchTerm, publishedJobs]);

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
            HRM System là nền tảng hàng đầu giúp kết nối tài năng với cơ hội.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Input
              size="large"
              placeholder="Tìm kiếm theo vị trí, phòng ban hoặc từ khóa..."
              prefix={<SearchOutlined className="text-gray-400 mr-2" />}
              className="w-full border border-gray-200 rounded-full px-6 py-3 shadow-sm hover:border-[#00aeef]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa tìm kiếm
              allowClear
              variant="borderless"
              style={{ border: "1px solid #e5e7eb", borderRadius: "9999px" }}
            />
          </div>
        </div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">
            {searchTerm ? `Kết quả tìm kiếm (${filteredJobs.length})` : "Vị trí tuyển dụng nổi bật"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" tip="Đang tải tin tuyển dụng...">
                <div style={{ padding: "50px" }} />
              </Spin>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.jobID} job={job} />
              ))}
            </div>
          ) : (
            <Empty description={searchTerm ? "Không tìm thấy công việc nào phù hợp." : "Hiện chưa có tin tuyển dụng nào được đăng."} />
          )}

          {!searchTerm && (
            <div className="text-center mt-12">
              <Link href="/tim-kiem-viec">
                <Button className="h-11 px-10 rounded border-gray-200 text-gray-600 font-medium hover:border-[#00aeef] hover:text-[#00aeef] flex items-center justify-center mx-auto group">
                  Xem tất cả công việc
                  <ArrowRightOutlined className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
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