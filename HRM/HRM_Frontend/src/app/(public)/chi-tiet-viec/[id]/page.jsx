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
  Row,
  Col,
  Spin,
  Empty,
  Divider,
} from "antd";
import {
  InboxOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined
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
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allJobs = await jobPostingService.getPublished();
        const currentJob = allJobs.find((item) => item.jobID === parseInt(id));
        setJob(currentJob);

        if (currentJob) {
          const related = allJobs.filter(
            (item) =>
              item.departmentID === currentJob.departmentID &&
              item.jobID !== currentJob.jobID,
          );
          setRelatedJobs(related.slice(0, 3));
        }
      } catch (err) {
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getSalaryDisplay = (j) => {
    const min = j?.salaryMin;
    const max = j?.salaryMax;
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
    if (min) return `Từ ${min.toLocaleString()} VNĐ`;
    if (max) return `Đến ${max.toLocaleString()} VNĐ`;
    return "Thỏa thuận";
  };

  const handleApply = () => {
    if (!isAgreed) {
      message.warning("Vui lòng tích chọn cam kết trước khi gửi!");
      return;
    }
    setApplyLoading(true);
    setTimeout(() => {
      message.success("Hồ sơ của bạn đã được gửi thành công!");
      setApplyLoading(false);
    }, 1500);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  if (!job) return <div className="text-center py-40 font-bold uppercase">Không tìm thấy công việc này</div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
      <style jsx global>{`
        .html-content-render {
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        .html-content-render table {
          width: 100% !important;
          display: block;
          overflow-x: auto;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumb
          className="mb-6 text-xs"
          items={[
            { title: <Link href="/">Trang chủ</Link> },
            { title: <Link href="/tim-kiem-viec">Việc làm</Link> },
            { title: <span className="font-bold text-[#00aeef]">{job.title}</span> },
          ]}
        />
        
        <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight mt-4">
          {job.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden" styles={{ body: { padding: "32px" } }}>
              <div className="flex flex-wrap gap-4 text-gray-500 mb-8 text-xs">
                <span className="flex items-center gap-2 font-bold text-[#154398] bg-blue-50 px-3 py-1 rounded-full">
                  <BankOutlined className="text-[#00aeef]" /> {job.department?.departmentName}
                </span>
                <span className="flex items-center gap-2 font-medium bg-gray-50 px-3 py-1 rounded-full">
                  <ClockCircleOutlined className="text-[#00aeef]" /> {job.position?.positionName}
                </span>
                <span className="flex items-center gap-2 font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                  <CalendarOutlined /> Hạn nộp: {dayjs(job.expiryDate).format("DD/MM/YYYY")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Số lượng tuyển</p>
                  <p className="text-lg font-black text-[#154398] m-0">{job.vacancies} Nhân sự</p>
                </div>
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Mức lương</p>
                  <p className="text-lg font-black text-red-600 m-0"><DollarCircleOutlined /> {getSalaryDisplay(job)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <InfoCircleOutlined className="text-lg text-[#00aeef]" />
                <h3 className="text-sm font-black text-gray-800 m-0 uppercase tracking-widest">Mô tả chi tiết công việc</h3>
              </div>

              <div className="text-gray-700 text-sm leading-relaxed html-content-render" dangerouslySetInnerHTML={{ __html: job.description }} />
              
              <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>Mã tin: #{job.jobID}</span>
                <span>Ngày đăng: {dayjs(job.createdAt).format("DD/MM/YYYY")}</span>
              </div>
            </Card>

            {/* RELATED JOBS SECTION */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-[#00aeef] rounded-full"></div>
                <h2 className="text-lg font-black text-gray-800 m-0 uppercase tracking-tight">Vị trí tương tự</h2>
              </div>

              {relatedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedJobs.map((rJob) => (
                    <Link href={`/chi-tiet-viec/${rJob.jobID}`} key={rJob.jobID}>
                      <Card hoverable className="rounded-xl border-none shadow-sm hover:shadow-md transition-all" styles={{ body: { padding: "20px" } }}>
                        <h4 className="text-sm font-bold text-gray-800 mb-4 line-clamp-2 h-10 uppercase">{rJob.title}</h4>
                        <div className="space-y-2 text-[11px] text-gray-500 font-medium">
                          <div className="flex items-center gap-2"><EnvironmentOutlined className="text-[#00aeef]" /> Lào Cai</div>
                          <div className="flex items-center gap-2 text-red-500"><DollarCircleOutlined /> {getSalaryDisplay(rJob)}</div>
                        </div>
                        <Divider className="my-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#00aeef] uppercase">Chi tiết <ArrowRightOutlined className="ml-1" /></span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tin liên quan" />
              )}
            </div>
          </div>

          {/* Apply CV */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-none shadow-xl shadow-blue-500/5 sticky top-24" styles={{ body: { padding: "28px" } }}>
              <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest text-center">Ứng tuyển</h3>
              <div className="space-y-5">
                <div>
                  <p className="font-bold text-gray-700 mb-2 text-[10px] uppercase tracking-wider">CV đính kèm <span className="text-red-500">*</span></p>
                  <Dragger className="bg-[#f8fafc] border-dashed border-gray-200"><InboxOutlined className="text-[#00aeef] text-xl mb-2" /><p className="text-[9px] text-gray-400">PDF/Word</p></Dragger>
                </div>
                <div>
                  <p className="font-bold text-gray-700 mb-2 text-[10px] uppercase tracking-wider">Lời nhắn</p>
                  <TextArea rows={3} placeholder="Giới thiệu..." className="rounded-lg text-xs" />
                </div>
                <div className="pt-2">
                  <Checkbox className="text-[9px] text-gray-500 block mb-5 leading-tight" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}>Tôi cam kết thông tin chính xác.</Checkbox>
                  <Button block type="primary" loading={applyLoading} disabled={!isAgreed} onClick={handleApply} className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-[#00aeef] border-none">Gửi đơn</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}