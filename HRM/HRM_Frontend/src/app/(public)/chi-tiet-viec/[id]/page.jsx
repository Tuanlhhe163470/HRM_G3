"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Input,
  Spin,
  Upload,
  Typography,
  Tag,
  Modal,
  App,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import candidateService from "@/services/Recruitment/candidateService";

const { Dragger } = Upload;
const { Text } = Typography;

export default function JobDetailsPage() {
  const { id } = useParams();
  const { notification } = App.useApp();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [candidate, setCandidate] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [fileList, setFileList] = useState([]);

  // FIX: Bỏ notification khỏi dependency array để tránh lỗi "useEffect changed size"
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
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể lấy thông tin chi tiết công việc.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]); //

  // HÀM KIỂM TRA ĐỊNH DẠNG EMAIL
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  // HÀM KIỂM TRA SỐ ĐIỆN THOẠI (VIỆT NAM)
  const validatePhone = (phone) => {
    return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(phone);
  };

  const handleApply = async () => {
    // 1. KIỂM TRA THÔNG TIN TRỐNG
    if (
      !candidate.fullName.trim() ||
      !candidate.email.trim() ||
      !candidate.phone.trim()
    ) {
      notification.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.",
      });
      return;
    }

    // 2. KIỂM TRA ĐỊNH DẠNG EMAIL & SĐT
    if (!validateEmail(candidate.email)) {
      notification.warning({
        message: "Email không hợp lệ",
        description:
          "Vui lòng nhập đúng định dạng email (Ví dụ: abc@gmail.com).",
      });
      return;
    }

    if (!validatePhone(candidate.phone)) {
      notification.warning({
        message: "Số điện thoại không hợp lệ",
        description: "Vui lòng nhập đúng số điện thoại di động (10 số).",
      });
      return;
    }

    // 3. KIỂM TRA FILE CV
    if (fileList.length === 0) {
      notification.warning({
        message: "Chưa tải CV",
        description: "Vui lòng đính kèm tệp hồ sơ (PDF hoặc Word) của bạn.",
      });
      return;
    }

    // 4. KIỂM TRA NÚT CAM KẾT
    if (!isAgreed) {
      notification.warning({
        message: "Yêu cầu xác nhận",
        description:
          "Bạn cần tích chọn cam kết thông tin chính xác trước khi gửi.",
      });
      return;
    }

    setApplyLoading(true);

    try {
      // Bước 1: Upload file
      const uploadRes = await candidateService.uploadCV(fileList[0]);
      const cvUrlFromServer = uploadRes.cvUrl;

      // Bước 2: Nộp đơn
      await candidateService.applyJob({
        ...candidate,
        cvUrl: cvUrlFromServer,
        jobID: parseInt(id),
      });

      notification.success({
        message: "Thành công",
        description: "Hồ sơ của bạn đã được gửi tới hệ thống HRM.",
      });

      // Reset form sau khi gửi thành công
      setCandidate({ fullName: "", email: "", phone: "" });
      setFileList([]);
      setIsAgreed(false);
      setPreviewUrl("");
    } catch (error) {
      notification.error({
        message: "Ứng tuyển thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  const getSalaryDisplay = (j) => {
    const min = j?.salaryMin;
    const max = j?.salaryMax;
    if (min && max)
      return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
    if (min) return `Từ ${min.toLocaleString()} VNĐ`;
    if (max) return `Đến ${max.toLocaleString()} VNĐ`;
    return "Thỏa thuận";
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewUrl("");
    },
    beforeUpload: (file) => {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      if (!isAllowed) {
        notification.error({
          message: "Sai định dạng",
          description: "Hệ thống chỉ chấp nhận file PDF hoặc Word.",
        });
        return false;
      }
      setFileList([file]);
      setPreviewUrl(URL.createObjectURL(file));
      return false;
    },
    fileList,
    showUploadList: false,
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div style={{ width: 200, height: 80 }} />
        </Spin>
      </div>
    );

  if (!job)
    return (
      <div className="text-center py-40 font-bold uppercase text-gray-400">
        Không tìm thấy công việc
      </div>
    );

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
      <style jsx global>{`
        .jd-container {
          min-height: 200px;
          height: auto;
        }
        .html-content-render {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: normal;
        }
        .html-content-render table {
          width: 100% !important;
          display: block;
          overflow-x: auto;
        }
        .apply-card .ant-input-affix-wrapper {
          border-radius: 12px;
          padding: 12px 15px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumb
          className="mb-6 text-xs"
          items={[
            { title: <Link href="/">Trang chủ</Link> },
            { title: <Link href="/tim-kiem-viec">Việc làm</Link> },
            {
              title: (
                <span className="font-bold text-[#00aeef]">{job.title}</span>
              ),
            },
          ]}
        />

        <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase leading-tight mt-4">
          {job.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="rounded-2xl border-none shadow-sm jd-container"
              styles={{ body: { padding: "32px" } }}
            >
              <div className="flex flex-wrap gap-4 text-gray-500 mb-8 text-xs">
                <span className="flex items-center gap-2 font-bold text-[#154398] bg-blue-50 px-3 py-1 rounded-full">
                  <BankOutlined className="text-[#00aeef]" />{" "}
                  {job.department?.departmentName}
                </span>
                <span className="flex items-center gap-2 font-medium bg-gray-50 px-3 py-1 rounded-full">
                  <ClockCircleOutlined className="text-[#00aeef]" />{" "}
                  {job.position?.positionName}
                </span>
                <span className="flex items-center gap-2 font-bold text-red-500 bg-red-100/50 px-3 py-1 rounded-full border border-red-100">
                  <CalendarOutlined /> Hạn nộp:{" "}
                  {dayjs(job.expiryDate).format("DD/MM/YYYY")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-[#f0f9ff] p-5 rounded-2xl border border-blue-100">
                  <p className="text-blue-400 text-[10px] uppercase font-bold mb-1 tracking-widest">
                    Số lượng
                  </p>
                  <p className="text-xl font-black text-[#154398] m-0">
                    {job.vacancies} Nhân sự
                  </p>
                </div>
                <div className="bg-[#fff1f0] p-5 rounded-2xl border border-red-100">
                  <p className="text-red-400 text-[10px] uppercase font-bold mb-1 tracking-widest">
                    Lương
                  </p>
                  <p className="text-xl font-black text-red-600 m-0">
                    <DollarCircleOutlined /> {getSalaryDisplay(job)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 mt-8">
                <InfoCircleOutlined className="text-lg text-[#00aeef]" />
                <h3 className="text-sm font-black text-gray-800 m-0 uppercase tracking-widest">
                  Mô tả công việc
                </h3>
              </div>
              <div
                className="text-gray-700 text-[15px] leading-relaxed html-content-render"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              <div className="mt-12 pt-6 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>Mã: #{job.jobID}</span>
                <span>
                  Đăng ngày: {dayjs(job.createdAt).format("DD/MM/YYYY")}
                </span>
              </div>
            </Card>

            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-[#00aeef] rounded-full"></div>
                <h2 className="text-lg font-black text-gray-800 m-0 uppercase tracking-tight">
                  Vị trí tương tự
                </h2>
              </div>
              {relatedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedJobs.map((rJob) => (
                    <Link
                      href={`/chi-tiet-viec/${rJob.jobID}`}
                      key={rJob.jobID}
                    >
                      <Card
                        hoverable
                        className="rounded-xl border-none shadow-sm h-full"
                        styles={{ body: { padding: "20px" } }}
                      >
                        <h4 className="text-sm font-bold text-gray-800 mb-4 line-clamp-2 h-10 uppercase tracking-tight leading-snug">
                          {rJob.title}
                        </h4>
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[11px]">
                          <DollarCircleOutlined /> {getSalaryDisplay(rJob)}
                        </div>
                        <Divider className="my-4" />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-[#00aeef] uppercase">
                            Chi tiết <ArrowRightOutlined className="ml-1" />
                          </span>
                          <Tag className="m-0 border-none bg-gray-50 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {dayjs(rJob.expiryDate).format("DD/MM")}
                          </Tag>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có tin tuyển dụng liên quan"
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card
              className="rounded-2xl border-none shadow-xl apply-card sticky top-24"
              styles={{ body: { padding: "32px" } }}
            >
              <h3 className="text-xl font-black text-gray-800 mb-8 uppercase text-center tracking-widest">
                Nộp Hồ Sơ
              </h3>
              <div className="space-y-5">
                <div className="space-y-4">
                  <Input
                    prefix={<UserOutlined className="text-gray-300" />}
                    placeholder="Họ và tên của bạn *"
                    value={candidate.fullName}
                    onChange={(e) =>
                      setCandidate({ ...candidate, fullName: e.target.value })
                    }
                  />
                  <Input
                    prefix={<MailOutlined className="text-gray-300" />}
                    placeholder="Email liên hệ *"
                    value={candidate.email}
                    onChange={(e) =>
                      setCandidate({ ...candidate, email: e.target.value })
                    }
                  />
                  <Input
                    prefix={<PhoneOutlined className="text-gray-300" />}
                    placeholder="Số điện thoại *"
                    value={candidate.phone}
                    onChange={(e) =>
                      setCandidate({ ...candidate, phone: e.target.value })
                    }
                  />
                </div>

                <div className="mt-6">
                  <p className="font-bold text-gray-700 mb-2 text-[10px] uppercase tracking-wider">
                    CV đính kèm *
                  </p>
                  {fileList.length === 0 ? (
                    <Dragger
                      {...uploadProps}
                      className="bg-gray-50/50 border-gray-100 hover:border-[#00aeef] transition-all"
                    >
                      <InboxOutlined className="text-[#00aeef] text-2xl mb-2" />
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Chọn hoặc kéo thả CV
                      </p>
                    </Dragger>
                  ) : (
                    <div className="bg-[#f0f9ff] p-4 rounded-2xl border border-blue-100 flex flex-col gap-3 group transition-all animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FilePdfOutlined className="text-red-500 text-xl" />
                          <Text className="text-[11px] font-bold text-blue-600 truncate max-w-[140px]">
                            {fileList[0].name}
                          </Text>
                        </div>
                        <Button
                          type="primary"
                          danger
                          shape="circle"
                          size="small"
                          icon={<DeleteOutlined className="text-xs" />}
                          onClick={() => {
                            setFileList([]);
                            setPreviewUrl("");
                          }}
                        />
                      </div>
                      <Button
                        block
                        icon={<EyeOutlined />}
                        onClick={() => setPreviewOpen(true)}
                        className="rounded-xl text-[10px] font-bold uppercase h-9 border-blue-200 text-[#00aeef] hover:bg-blue-50"
                      >
                        Xem nhanh CV
                      </Button>
                    </div>
                  )}
                </div>

                <Checkbox
                  className="text-[10px] text-gray-400 block leading-relaxed"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                >
                  Tôi cam kết thông tin chính xác.
                </Checkbox>
                <Button
                  block
                  type="primary"
                  loading={applyLoading}
                  onClick={handleApply}
                  className="h-14 mt-4 rounded-2xl font-black uppercase text-[11px] bg-[#00aeef] border-none shadow-lg tracking-widest disabled:bg-gray-200 hover:scale-[1.02] transition-transform"
                >
                  Gửi đơn ứng tuyển
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        title={
          <span className="uppercase tracking-widest text-sm font-black text-[#154398]">
            Xem trước hồ sơ
          </span>
        }
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={900}
        centered
        footer={null}
        styles={{ body: { height: "75vh", padding: 0 } }}
      >
        <iframe
          src={previewUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="CV Preview"
        />
      </Modal>
    </div>
  );
}
