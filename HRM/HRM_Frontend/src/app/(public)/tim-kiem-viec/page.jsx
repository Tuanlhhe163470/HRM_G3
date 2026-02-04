"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Input,
  Checkbox,
  Slider,
  Button,
  Select,
  Pagination,
  Card,
  Tag,
  Row,
  Col,
  Breadcrumb,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const jobsData = [
  {
    id: 1,
    title: "Senior Frontend Developer (React)",
    company: "Tech Solutions Inc.",
    location: "Hồ Chí Minh",
    salary: "35 - 50 triệu VNĐ",
    type: "Full-time",
    posted: "2 ngày trước",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "Hà Nội",
    salary: "25 - 45 triệu VNĐ",
    type: "Full-time",
    posted: "1 tuần trước",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Analytics Hub",
    location: "Đà Nẵng",
    salary: "30 - 50 triệu VNĐ",
    type: "Full-time",
    posted: "3 ngày trước",
  },
  {
    id: 4,
    title: "Part-time Content Writer",
    company: "Marketing Pros",
    location: "Remote",
    salary: "10 - 15 triệu VNĐ",
    type: "Part-time",
    posted: "4 ngày trước",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Cloud Innovators",
    location: "Hồ Chí Minh",
    salary: "45 - 80 triệu VNĐ",
    type: "Full-time",
    posted: "1 ngày trước",
  },
  {
    id: 6,
    title: "Junior Software Engineer",
    company: "Startup X",
    location: "Hà Nội",
    salary: "15 - 25 triệu VNĐ",
    type: "Full-time",
    posted: "5 ngày trước",
  },
];

export default function JobListingsPage() {
  const [salaryRange, setSalaryRange] = useState([0, 100]);

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
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
                <span className="font-bold text-[#00aeef]">
                  Danh sách việc làm
                </span>
              ),
            },
          ]}
        />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Row gutter={[32, 32]}>
          {/* SIDEBAR FILTERS */}
          <Col xs={24} lg={6}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <FilterOutlined className="text-[#00aeef]" />
                <h3 className="text-lg font-bold text-gray-800 m-0 uppercase tracking-wide">
                  Bộ lọc tìm kiếm
                </h3>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="font-bold text-gray-700 mb-3 text-sm">
                    Vị trí công việc
                  </p>
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Nhập chức danh..."
                    className="rounded-lg border-gray-200 hover:border-[#00aeef]"
                  />
                </div>

                <div>
                  <p className="font-bold text-gray-700 mb-3 text-sm">
                    Địa điểm làm việc
                  </p>
                  <Checkbox.Group className="flex flex-col gap-3 custom-checkbox">
                    <Checkbox value="hanoi">Hà Nội</Checkbox>
                    <Checkbox value="hcm">Hồ Chí Minh</Checkbox>
                    <Checkbox value="danang">Đà Nẵng</Checkbox>
                    <Checkbox value="remote">Làm việc từ xa</Checkbox>
                  </Checkbox.Group>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-gray-700 m-0 text-sm">
                      Mức lương (Triệu)
                    </p>
                    <span className="text-[#00aeef] font-bold text-xs bg-blue-50 px-2 py-1 rounded">
                      {salaryRange[0]}tr - {salaryRange[1]}tr+
                    </span>
                  </div>
                  <Slider
                    range
                    min={0}
                    max={100}
                    defaultValue={[0, 100]}
                    onChange={(val) => setSalaryRange(val)}
                    trackStyle={[{ backgroundColor: "#00aeef" }]}
                    handleStyle={[
                      { borderColor: "#00aeef", backgroundColor: "#fff" },
                      { borderColor: "#00aeef", backgroundColor: "#fff" },
                    ]}
                  />
                </div>

                <div className="pt-4 border-t border-gray-50 flex gap-3">
                  <Button
                    block
                    type="primary"
                    className="bg-[#00aeef] border-none font-bold h-10 rounded-lg"
                  >
                    ÁP DỤNG
                  </Button>
                  <Button
                    block
                    className="h-10 rounded-lg border-gray-200 text-gray-400"
                  >
                    XÓA
                  </Button>
                </div>
              </div>
            </div>
          </Col>

          {/* MAIN CONTENT */}
          <Col xs={24} lg={18}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <span className="text-gray-400 text-sm">Kết quả tìm kiếm:</span>
                <span className="ml-2 font-bold text-gray-700">
                  240 công việc khả dụng
                </span>
              </div>
              <Select defaultValue="newest" style={{ width: 160 }}>
                <Select.Option value="newest">Mới nhất</Select.Option>
                <Select.Option value="salary">Lương cao nhất</Select.Option>
              </Select>
            </div>

            <Row gutter={[24, 24]}>
              {jobsData.map((job) => (
                <Col xs={24} md={12} xl={8} key={job.id}>
                  <Link href={`/chi-tiet-cong-viec/${job.id}`}>
                    <Card
                      hoverable
                      className="rounded-2xl border-gray-100 shadow-sm overflow-hidden h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      styles={{
                        body: {
                          padding: "24px",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        },
                      }}
                    >
                      <div className="mb-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-[#00aeef] group-hover:bg-[#00aeef] group-hover:text-white transition-colors">
                            <ClockCircleOutlined />
                          </div>
                          <Tag className="m-0 border-none bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">
                            {job.posted}
                          </Tag>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 m-0 group-hover:text-[#00aeef] transition-colors leading-tight mb-2 h-12 overflow-hidden">
                          {job.title}
                        </h4>
                        <p className="text-[#154398] font-bold text-xs uppercase tracking-wider">
                          {job.company}
                        </p>
                      </div>

                      <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-center text-gray-500 text-sm gap-2">
                          <EnvironmentOutlined className="text-gray-300" />
                          <span className="font-medium italic">
                            {job.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarCircleOutlined className="text-[#00aeef]" />
                          <span className="font-extrabold text-gray-700 text-base">
                            {job.salary}
                          </span>
                        </div>
                        <Tag
                          color="cyan"
                          className="rounded border-none bg-cyan-50 text-cyan-600 font-bold px-3 py-0.5 text-[11px] m-0"
                        >
                          {job.type}
                        </Tag>
                      </div>

                      <Button
                        block
                        type="primary"
                        className="bg-[#00aeef] border-none h-11 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0096ce] transition-all shadow-lg shadow-blue-50"
                      >
                        Xem chi tiết & Ứng tuyển
                      </Button>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            <div className="mt-16 flex justify-center">
              <Pagination
                defaultCurrent={1}
                total={50}
                showSizeChanger={false}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
