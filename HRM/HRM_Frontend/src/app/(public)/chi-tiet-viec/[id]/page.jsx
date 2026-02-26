"use client";

import React, { useState, useEffect } from "react";
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
  Spin,
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
import { useParams } from "next/navigation";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import dayjs from "dayjs";

const { Dragger } = Upload;
const { TextArea } = Input;

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);

  // Lấy dữ liệu chi tiết công việc từ Backend
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobPostingService.getAll(); // Sử dụng chung hàm lấy list và tìm ID
        const found = res.find((item) => item.jobID === parseInt(id));
        setJob(found);
      } catch (err) {
        message.error("Không thể tải thông tin công việc");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    setApplyLoading(true);
    setTimeout(() => {
      message.success("Hồ sơ của bạn đã được gửi thành công!");
      setApplyLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }
  if (!job)
    return (
      <div className="text-center py-40 font-bold">
        Không tìm thấy công việc này
      </div>
    );

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
                <Link href="/tim-kiem-viec" className="text-gray-400">
                  Danh sách việc làm
                </Link>
              ),
            },
            {
              title: (
                <span className="font-bold text-[#00aeef]">{job.title}</span>
              ),
            },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="rounded-2xl border-gray-100 shadow-sm overflow-hidden"
              styles={{ body: { padding: "32px" } }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-gray-500 text-sm mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-2 font-medium text-[#154398]">
                  <BankOutlined />{" "}
                  {job.department?.departmentName }
                </div>
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined />{" "}
                  {job.position?.positionName }
                </div>
                <div className="flex items-center gap-2">
                  <CalendarOutlined /> Đăng ngày:{" "}
                  {dayjs(job.createdAt).format("DD/MM/YYYY")}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase text-sm tracking-widest border-l-4 border-[#00aeef] pl-3">
                    Chi tiết tuyển dụng
                  </h3>

                  <div
                    className="text-gray-600 leading-relaxed text-base html-content-render break-words" // Thêm break-words
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase text-sm tracking-widest border-l-4 border-[#00aeef] pl-3">
                    Thông tin bổ sung
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">
                        Số lượng tuyển
                      </p>
                      <p className="font-bold text-gray-700">
                        {job.vacancies} nhân sự
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">
                        Hạn nộp hồ sơ
                      </p>
                      <p className="font-bold text-red-500">
                        {dayjs(job.expiryDate).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

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
                  <Dragger className="bg-[#f8fafc] border-dashed border-gray-200 hover:border-[#00aeef]">
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
                    Thư giới thiệu
                  </p>
                  <TextArea
                    rows={4}
                    placeholder="Giới thiệu ngắn gọn về bản thân..."
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <Checkbox className="text-[10px] text-gray-400 block">
                    Tôi đồng ý với các điều khoản bảo mật dữ liệu.
                  </Checkbox>
                  <Button
                    block
                    type="primary"
                    size="large"
                    loading={applyLoading}
                    onClick={handleApply}
                    className="bg-[#00aeef] border-none h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0096ce] shadow-lg shadow-blue-50"
                  >
                    Gửi đơn ứng tuyển
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
