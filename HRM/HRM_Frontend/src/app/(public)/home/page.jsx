import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import JobCard from "@/components/Job/JobCard";
import Image from "next/image";

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

          <div className="flex justify-center gap-3 mb-10">
            <button className="bg-[#00aeef] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#0096ce] transition-colors">
              Khám phá việc làm
            </button>
            <button className="border border-gray-200 px-6 py-2.5 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>

          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm việc làm, công ty hoặc từ khóa..."
              className="w-full border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#00aeef] transition-all"
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
            <button className="border border-gray-200 px-8 py-2.5 rounded text-sm font-medium hover:bg-gray-50 transition-all text-gray-600">
              Xem tất cả công việc
            </button>
          </div>
        </div>
      </section>

      {/* DISCOVER SECTION */}
      <section className="py-20 border-t border-gray-50">
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
            <button className="border border-gray-200 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-all">
              Xem tất cả danh sách
            </button>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/homepage-1.png"
              alt="Discover"
              width={500}
              height={350}
              className="rounded-lg shadow-sm"
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
              alt="HRM System"
              width={500}
              height={350}
              className="rounded-lg shadow-sm"
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
            <button className="border border-gray-200 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-all">
              Khám phá giải pháp HRM
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
