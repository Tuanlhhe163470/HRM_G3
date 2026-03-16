"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Divider,
  App,
  Row,
  Col,
  Spin,
  Tag,
  Select,
  Avatar,
  Table,
  Tooltip, // Đã thêm Tooltip vào đây để hết lỗi ReferenceError
} from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileSearchOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import candidateService from "@/services/Recruitment/candidateService";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import salaryComponentService from "@/services/Payroll/salaryComponentService";
import axiosClient from "@/lib/axiosClient"; // Import để gọi lấy phòng ban
import { docSoVietNam } from "@/lib/stringsUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function CreateOfferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const candidateId = searchParams.get("candidateId");

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [jobInfo, setJobInfo] = useState(null);

  // States cho danh sách
  const [passedCandidates, setPassedCandidates] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]); // State lưu TẤT CẢ phòng ban

  // States bộ lọc
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);

  const [salaryComponents, setSalaryComponents] = useState([]);

  const salaryValue = Form.useWatch("basicSalary", form);

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // 1. Tải dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (candidateId) {
          // TRƯỜNG HỢP CHI TIẾT OFFER
          const [candidateData, componentsData, allJobs] = await Promise.all([
            candidateService.getById(candidateId),
            salaryComponentService.getAll(),
            jobPostingService.getAll(),
          ]);

          setCandidate(candidateData);
          setSalaryComponents(componentsData);

          if (candidateData && allJobs) {
            const currentJob = allJobs.find(
              (j) => j.title === candidateData.jobTitle,
            );
            if (currentJob) {
              setJobInfo(currentJob);
              if (currentJob.salaryMin) {
                form.setFieldsValue({ basicSalary: currentJob.salaryMin });
              }
            }
          }
        } else {
          // TRƯỜNG HỢP DANH SÁCH CHỜ
          const [allCandidates, deptRes] = await Promise.all([
            candidateService.getAdminList(),
            axiosClient.get("/Departments"), // Lấy tất cả phòng ban từ hệ thống
          ]);

          setPassedCandidates(
            allCandidates.filter((c) => c.status === "Passed"),
          );
          setAllDepartments(deptRes.data || deptRes); // Lưu danh sách phòng ban đầy đủ
        }
      } catch (error) {
        notification.error({
          title: "Lỗi tải dữ liệu",
          description: "Không thể kết nối với máy chủ.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [candidateId, notification, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        candidateID: parseInt(candidateId),
        basicSalary: values.basicSalary,
        joinDate: values.joinDate.format("YYYY-MM-DD"),
        note: values.note,
        allowanceIds: values.allowances || [],
      };
      const response = await candidateService.createOffer(submitData);
      notification.success({
        title: "Thành công",
        description: response.message,
      });
      router.push("/recruitment/offer/list");
    } catch (error) {
      let errorMsg =
        typeof error.response?.data === "string"
          ? error.response.data.split("\n")[0].replace("System.Exception: ", "")
          : error.response?.data?.message || "Gửi Offer thất bại.";
      notification.error({ title: "Lỗi hệ thống", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LỌC TẠI CHỖ ---
  const filteredCandidates = passedCandidates.filter((c) => {
    const matchName = c.fullName
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    // Lọc theo tên phòng ban (vì bảng ứng viên của bạn thường chứa departmentName)
    const matchDept = filterDept ? c.departmentName === filterDept : true;
    return matchName && matchDept;
  });

  // --- GIAO DIỆN 1: DANH SÁCH CHỜ ---
  if (!candidateId) {
    const columns = [
      {
        title: "Ứng viên",
        key: "info",
        width: 280,
        render: (_, record) => (
          <Space>
            <Avatar
              className="bg-blue-100 text-blue-600"
              icon={<UserOutlined />}
            />
            <div>
              <Text strong className="block">
                {record.fullName}
              </Text>
              <Text type="secondary" className="text-[11px]">
                {record.email}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: "Phòng ban",
        dataIndex: "departmentName",
        width: 180,
        render: (dept) => (
          <Tag color="blue" className="rounded-md border-none px-2">
            {dept || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Vị trí ứng tuyển",
        dataIndex: "jobTitle",
        ellipsis: true,
        render: (title) => (
          <Tooltip title={title} placement="topLeft">
            <span className="text-gray-600">{title}</span>
          </Tooltip>
        ),
      },
      {
        title: "Điểm PV",
        dataIndex: "score",
        align: "center",
        width: 100,
        render: (s) => (
          <Tag color="cyan" className="font-bold">
            {s}/10
          </Tag>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        align: "center",
        width: 120,
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            className="bg-[#154398] rounded-md"
            onClick={() => router.push(`?candidateId=${record.candidateID}`)}
          >
            Lập Offer
          </Button>
        ),
      },
    ];

    return (
      <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
                <FileSearchOutlined style={{ fontSize: "24px" }} />
              </div>
              <h1 className="text-2xl font-black text-[#154398] uppercase m-0">
                Ứng viên chờ Offer
              </h1>
            </div>

            {/* BỘ LỌC ĐẦY ĐỦ */}
            <Space size="middle">
              <Input
                placeholder="Tìm tên ứng viên..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="w-64 h-10 rounded-xl border-none shadow-sm"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Tất cả phòng ban"
                allowClear
                className="w-56 h-10 shadow-sm"
                onChange={(val) => setFilterDept(val)}
                // Đổ tất cả phòng ban từ API Departments vào đây
                options={allDepartments.map((d) => ({
                  label: d.departmentName,
                  value: d.departmentName,
                }))}
              />
            </Space>
          </div>

          <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
            <Table
              dataSource={filteredCandidates}
              columns={columns}
              loading={loading}
              rowKey="candidateID"
              pagination={{
                pageSize: 8,
                showTotal: (t) => `Tổng cộng ${t} ứng viên`,
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN 2: CHI TIẾT OFFER (GIỮ NGUYÊN LAYOUT) ---
  if (loading && !candidate)
    return (
      <div className="p-20 text-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className="p-0 text-slate-500 w-fit h-auto"
          onClick={() => router.push("/recruitment/offer/create")}
        >
          Quay lại danh sách chờ
        </Button>

        <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">
          Thiết lập Thư mời làm việc
        </h1>

        <Row gutter={24}>
          <Col span={8}>
            <Card className="rounded-2xl border-none shadow-sm sticky top-6 overflow-hidden">
              <div className="bg-[#154398]/5 p-6 text-center -m-6 mb-6 border-b border-blue-100">
                <Avatar
                  size={80}
                  className="bg-white text-[#154398] shadow-sm mb-3"
                  icon={<UserOutlined />}
                />
                <Title level={4} className="m-0 text-[#154398]">
                  {candidate?.fullName}
                </Title>
                <Text strong className="text-blue-500 text-xs uppercase">
                  {candidate?.jobTitle || jobInfo?.title}
                </Text>
              </div>
              <div className="space-y-4">
                <div>
                  <Text
                    type="secondary"
                    className="text-[10px] font-bold uppercase block text-slate-400"
                  >
                    Email liên hệ
                  </Text>
                  <Text className="text-sm">{candidate?.email}</Text>
                </div>

                <div className="flex items-center gap-2">
                  <Text
                    type="secondary"
                    className="text-[10px] font-bold uppercase block text-slate-400"
                  >
                    Điểm phỏng vấn
                  </Text>
                  <Tag
                    color="blue"
                    className="font-bold border-none bg-blue-50 text-blue-600 px-3"
                  >
                    {candidate?.score}/10
                  </Tag>
                </div>

                {(jobInfo?.salaryMin || jobInfo?.salaryMax) && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <Text
                      type="warning"
                      className="text-[10px] font-bold uppercase block mb-1 flex items-center gap-1 text-orange-600"
                    >
                      <InfoCircleOutlined /> Khung lương vị trí
                    </Text>
                    <Text strong className="text-[14px] text-orange-700">
                      {jobInfo.salaryMin
                        ? `${jobInfo.salaryMin.toLocaleString()}đ`
                        : "???"}
                      {" - "}
                      {jobInfo.salaryMax
                        ? `${jobInfo.salaryMax.toLocaleString()}đ`
                        : "Thỏa thuận"}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col span={16}>
            <Card className="rounded-2xl border-none shadow-sm">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="p-2"
              >
                <h1 className="font-bold text-[#154398] mb-5 flex items-center gap-2">
                  <DollarOutlined /> Lương & Phụ cấp
                </h1>

                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <span className="font-bold whitespace-nowrap min-w-[150px]">
                      Lương cơ bản:
                    </span>
                    <Form.Item
                      name="basicSalary"
                      noStyle
                      rules={[
                        { required: true, message: "Vui lòng nhập mức lương" },
                      ]}
                    >
                      <InputNumber
                        className="flex-1 h-12 rounded-xl text-lg font-bold pt-1"
                        placeholder="Nhập số tiền..."
                        style={{ width: "100%" }}
                        controls={false}
                        min={0}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) event.preventDefault();
                        }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value?.replace(/\D/g, "")}
                      />
                    </Form.Item>
                  </div>

                  {salaryValue > 0 && (
                    <div className="flex gap-4 mt-2">
                      <div className="min-w-[150px] invisible"></div>
                      <div className="flex-1 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <Text italic className="text-[#154398] text-[13px]">
                          <span className="font-bold">Bằng chữ:</span>{" "}
                          {docSoVietNam(salaryValue)}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>

                <Form.Item
                  label={
                    <span className="font-bold">Ngày nhận việc dự kiến:</span>
                  }
                  name="joinDate"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày nhận việc dự kiến",
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full h-11 rounded-xl"
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                  />
                </Form.Item>

                <Divider className="my-6" />

                <Form.Item
                  label={
                    <span className="font-bold text-[#154398]">
                      Các loại phụ cấp đính kèm:
                    </span>
                  }
                  name="allowances"
                >
                  <Select
                    mode="multiple"
                    allowClear
                    className="w-full h-11"
                    placeholder="Chọn phụ cấp..."
                    options={salaryComponents.map((item) => ({
                      label: `${item.componentName} (+${item.amount?.toLocaleString()} đ)`,
                      value: item.componentID,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold">Ghi chú thêm:</span>}
                  name="note"
                >
                  <Input.TextArea
                    rows={4}
                    className="rounded-xl"
                    placeholder="Ví dụ: Thử việc 2 tháng 85% lương..."
                  />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-10">
                  <Button
                    className="h-12 px-8 rounded-xl font-bold"
                    onClick={() => router.push("/recruitment/candidates")}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-12 px-12 rounded-xl bg-[#154398] font-bold shadow-lg"
                    icon={<SendOutlined />}
                    loading={loading}
                  >
                    Gửi Offer ngay
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
