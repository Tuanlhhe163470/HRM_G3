"use client";

import React, { useState } from "react";
import {
  Button,
  Tag,
  Card,
  Upload,
  Input,
  Checkbox,
  message,
  Breadcrumb,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  InboxOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Dragger } = Upload;
const { TextArea } = Input;

// Dữ liệu mẫu cho công việc liên quan
const relatedJobs = [
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "Hà Nội",
    salary: "25 - 45 triệu",
    type: "Full-time",
  },
  {
    id: 3,
    title: "React Native Developer",
    company: "App Studio",
    location: "Hồ Chí Minh",
    salary: "30 - 55 triệu",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Frontend Lead",
    company: "Global Tech",
    location: "Đà Nẵng",
    salary: "50 - 70 triệu",
    type: "Remote",
  },
];

export default function JobDetailsPage() {
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => {
      message.success("Hồ sơ của bạn đã được gửi thành công!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
      {/* BREADCRUMB SECTION */}
      <div className="max-w-7xl mx-auto px-6 pt-8 mb-6">
        <Breadcrumb
          items={[
            {
              title: (
                <Link href="/" className="text-gray-400">
                  Trang chủ
                </Link>
              ),
            },
            {
              title: (
                <Link href="/tim-kiem-viec" className="text-gray-400">
                  Danh sách việc làm
                </Link>
              ),
            },
            {
              title: (
                <span className="font-bold text-[#00aeef]">
                  Chi tiết công việc
                </span>
              ),
            },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Job Description Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="rounded-2xl border-gray-100 shadow-sm"
              styles={{ body: { padding: "32px" } }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Senior Frontend Developer
              </h1>

              <div className="flex flex-wrap gap-6 text-gray-500 text-sm mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-2 font-medium text-[#154398]">
                  <BankOutlined /> Tech Innovations Inc.
                </div>
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined /> TP. Hồ Chí Minh (Hybrid)
                </div>
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined /> Toàn thời gian
                </div>
                <div className="flex items-center gap-2">
                  <CalendarOutlined /> Đăng ngày: 22/05/2024
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Mô tả công việc
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Chúng tôi đang tìm kiếm một Lập trình viên Frontend (Senior)
                    tài năng để gia nhập đội ngũ kỹ thuật năng động. Trong vai
                    trò này, bạn sẽ chịu trách nhiệm chính trong việc dẫn dắt sự
                    phát triển các tính năng phía người dùng, từ ý tưởng đến
                    triển khai, đảm bảo hiệu suất cao và khả năng mở rộng tối
                    ưu.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Trách nhiệm
                  </h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-600">
                    <li>
                      Thiết kế và xây dựng các ứng dụng web chất lượng cao, có
                      thể tái sử dụng bằng ReactJS, Next.js.
                    </li>
                    <li>
                      Phối hợp chặt chẽ với Product Manager, UI/UX Designer để
                      định nghĩa và thực hiện các tính năng mới.
                    </li>
                    <li>
                      Tối ưu hóa ứng dụng để đạt tốc độ tối đa và khả năng tương
                      thích đa thiết bị.
                    </li>
                    <li>
                      Review code và hướng dẫn các thành viên cấp dưới để cải
                      thiện chất lượng kỹ thuật của cả đội.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Yêu cầu ứng viên
                  </h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-600">
                    <li>
                      Tốt nghiệp Đại học chuyên ngành CNTT hoặc các ngành liên
                      quan.
                    </li>
                    <li>
                      Hơn 5 năm kinh nghiệm thực tế trong phát triển Frontend,
                      tập trung mạnh vào React.js.
                    </li>
                    <li>
                      Thành thạo TypeScript, HTML5, CSS3 và các tiêu chuẩn ES6+.
                    </li>
                    <li>
                      Có kinh nghiệm với Server-side Rendering (Next.js) và tối
                      ưu hóa SEO.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase text-sm tracking-widest">
                    Kỹ năng yêu cầu
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "React.js",
                      "TypeScript",
                      "Next.js",
                      "Tailwind CSS",
                      "GraphQL",
                      "AWS",
                      "Unit Testing",
                      "CI/CD",
                      "Redux",
                      "Zustand",
                    ].map((skill) => (
                      <Tag
                        key={skill}
                        className="px-4 py-1 rounded-full border-none bg-blue-50 text-[#00aeef] font-bold m-0"
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Apply Form */}
          <div className="space-y-6">
            <Card
              className="rounded-2xl border-gray-100 shadow-xl shadow-blue-500/5 sticky top-24"
              styles={{ body: { padding: "24px" } }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wide text-center">
                Ứng tuyển ngay
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="font-bold text-gray-700 mb-2 text-sm">
                    Tải lên CV (PDF, Word)
                  </p>
                  <Dragger className="bg-[#f8fafc] border-dashed border-gray-200 hover:border-[#00aeef] transition-all">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-[#00aeef] text-2xl" />
                    </p>
                    <p className="ant-upload-text text-xs font-medium text-gray-400">
                      Kéo thả hoặc nhấn để chọn file
                    </p>
                  </Dragger>
                </div>

                <div>
                  <p className="font-bold text-gray-700 mb-2 text-sm">
                    Thư giới thiệu (Không bắt buộc)
                  </p>
                  <TextArea
                    rows={4}
                    placeholder="Tại sao bạn phù hợp với vị trí này?"
                    className="rounded-lg border-gray-200"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm m-0">
                        Hồ sơ Sarah Chen
                      </p>
                      <p className="text-gray-400 text-[10px] m-0">
                        Sẵn sàng gửi kèm đơn ứng tuyển
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Checkbox className="text-[10px] text-gray-400 block">
                    Tôi đồng ý cung cấp lý dữ liệu hồ sơ của mình.
                  </Checkbox>

                  <Button
                    block
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleApply}
                    className="bg-[#00aeef] border-none h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0096ce] shadow-lg shadow-blue-50 transition-all mt-4"
                  >
                    Gửi đơn ứng tuyển
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* RELATED JOBS SECTION*/}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-[#00aeef] rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800 m-0 uppercase tracking-tight">
              Công việc khác
            </h2>
          </div>

          <Row gutter={[24, 24]}>
            {relatedJobs.map((job) => (
              <Col xs={24} md={8} key={job.id}>
                <Link href={`/chi-tiet-viec/${job.id}`}>
                  <Card
                    hoverable
                    className="rounded-2xl border-gray-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    styles={{ body: { padding: "24px" } }}
                  >
                    <h4 className="text-base font-bold text-gray-800 mb-1 group-hover:text-[#00aeef] transition-colors">
                      {job.title}
                    </h4>
                    <p className="text-[#154398] font-bold text-[11px] uppercase mb-4 tracking-wider">
                      {job.company}
                    </p>

                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <EnvironmentOutlined /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <DollarCircleOutlined className="text-[#00aeef]" />{" "}
                        {job.salary} VNĐ
                      </div>
                    </div>

                    <Tag
                      color="cyan"
                      className="m-0 border-none bg-cyan-50 text-cyan-600 font-bold px-3 text-[10px]"
                    >
                      {job.type}
                    </Tag>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}
