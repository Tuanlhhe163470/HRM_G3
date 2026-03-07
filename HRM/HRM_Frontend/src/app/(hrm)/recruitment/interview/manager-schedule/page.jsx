"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Tag,
  Avatar,
  Card,
  Button,
  Modal,
  Form,
  Input,
  App,
  Empty,
  Spin,
  Rate,
  Divider,
  Select,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SolutionOutlined,
  MailOutlined,
  FilePdfOutlined,
  EditOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { decodeJWT } from "@/lib/base64";
import candidateService from "@/services/Recruitment/candidateService";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function ManagerInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification, modal } = App.useApp();

  const candidateIdFromUrl = searchParams.get("candidateId");

  const [managerInfo, setManagerInfo] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState({
    day: new Date().getDate(),
    date: new Date(),
  });
  const renderStatusTag = (status) => {
    switch (status) {
      case "Passed":
        return (
          <Tag color="success" className="text-[9px] m-0 px-1">
            ĐẠT
          </Tag>
        );
      case "Fail":
        return (
          <Tag color="error" className="text-[9px] m-0 px-1">
            LOẠI
          </Tag>
        );
      default:
        return (
          <Tag color="orange" className="text-[9px] m-0 px-1">
            CHỜ PV
          </Tag>
        );
    }
  };
  const [loading, setLoading] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [waitingCandidates, setWaitingCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. Giải mã Token lấy thông tin Manager
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        setManagerInfo({
          deptId: payload.DepartmentId ? parseInt(payload.DepartmentId) : null,
          deptName: payload.DepartmentName,
        });
      }
    }
  }, []);

  // 2. Lấy toàn bộ lịch phỏng vấn (để hiển thị chấm tròn trên lịch và lọc sự kiện)
  const fetchDeptInterviews = useCallback(async (currentManager) => {
    const targetDeptId = currentManager?.deptId;
    if (!targetDeptId) return [];

    try {
      const res = await candidateService.getAllInterviews();
      const filtered = res.filter(
        (inv) => Number(inv.departmentID) === Number(targetDeptId),
      );
      setInterviews(filtered);
      return filtered;
    } catch (error) {
      console.error("Lỗi tải lịch phòng ban:", error);
      return [];
    }
  }, []);

  // 3. Lấy danh sách ứng viên ĐANG CHỜ PHỎNG VẤN (Trạng thái Interview)
  const fetchWaitingList = useCallback(async (currentManager) => {
    if (!currentManager?.deptId) return;
    try {
      const res = await candidateService.getAdminList();

      // Lọc theo phòng ban và CHỈ lấy trạng thái 'Interview'
      const waiting = res.filter(
        (c) =>
          ["Interview", "Passed", "Fail"].includes(c.status) &&
          Number(c.departmentID) === Number(currentManager.deptId),
      );

      setWaitingCandidates(waiting);
    } catch (error) {
      console.error("Lỗi lấy danh sách chờ:", error);
    }
  }, []);

  useEffect(() => {
    if (managerInfo) {
      fetchDeptInterviews(managerInfo);
      fetchWaitingList(managerInfo);
    }
  }, [managerInfo, fetchDeptInterviews, fetchWaitingList]);

  // 4. Logic nhảy lịch khi có CandidateID từ URL
  useEffect(() => {
    const loadInit = async () => {
      if (!candidateIdFromUrl || !managerInfo) {
        if (!candidateIdFromUrl) setCandidateInfo(null);
        return;
      }

      setLoading(true);
      try {
        const [detail, allDeptInv] = await Promise.all([
          candidateService.getById(candidateIdFromUrl),
          fetchDeptInterviews(managerInfo),
        ]);

        setCandidateInfo(detail);

        const myInv = allDeptInv.find(
          (i) => Number(i.candidateID) === Number(candidateIdFromUrl),
        );

        if (myInv) {
          const d = new Date(myInv.interviewDate);
          setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
          setSelectedDay({ day: d.getDate(), date: d });
        }
      } catch (e) {
        notification.error({
          message: "Lỗi",
          description: "Không tải được hồ sơ.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadInit();
  }, [candidateIdFromUrl, managerInfo, fetchDeptInterviews, notification]);

  const dailyInterviews = interviews.filter((i) =>
    dayjs(i.interviewDate).isSame(dayjs(selectedDay.date), "day"),
  );

  const handleEvaluation = async (values) => {
    const { score, finalDecision } = values;

    // Kiểm tra trường hợp mâu thuẫn giữa điểm và kết quả
    if (score >= 8 && finalDecision === "FAIL") {
      modal.confirm({
        title: "Xác nhận kết quả bất thường",
        content: `Ứng viên có điểm chuyên môn rất cao (${score}/10). Bạn có chắc chắn muốn LOẠI ứng viên này không?`,
        okText: "Đúng, tôi muốn loại",
        cancelText: "Để tôi xem lại",
        onOk: () => submitData(values),
      });
      return;
    }

    if (score < 5 && finalDecision === "PASS") {
      modal.confirm({
        title: "Xác nhận kết quả bất thường",
        content: `Ứng viên có điểm chuyên môn thấp (${score}/10). Bạn có chắc chắn muốn cho ứng viên này ĐẠT không?`,
        okText: "Đúng, vẫn cho đạt",
        cancelText: "Để tôi xem lại",
        onOk: () => submitData(values),
      });
      return;
    }

    // Nếu không có mâu thuẫn hoặc điểm bình thường thì gửi luôn
    submitData(values);
  };

  // Tách hàm gửi dữ liệu để tái sử dụng
  const submitData = async (values) => {
    try {
      await candidateService.evaluateCandidate(
        candidateInfo.candidateID,
        values,
      );
      notification.success({
        title: "Thành công",
        description: "Đã lưu đánh giá.",
      });
      setIsEvalModalOpen(false);
      form.resetFields();
      // Reload lại danh sách sau khi đánh giá xong
      fetchWaitingList(managerInfo);
    } catch (e) {
      notification.error({
        title: "Lỗi",
        description: "Không thể lưu nhận xét.",
      });
    }
  };

  const calendarDays = (() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    for (let i = 0; i < firstDayIndex; i++)
      days.push({ type: "empty", key: `e-${i}` });
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const hasEvent = interviews.some((inv) =>
        dayjs(inv.interviewDate).isSame(dayjs(date), "day"),
      );
      days.push({ type: "day", key: `d-${i}`, day: i, date, hasEvent });
    }
    return days;
  })();

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.score !== undefined) {
      const autoDecision = changedValues.score >= 5 ? "PASS" : "FAIL";
      form.setFieldsValue({ finalDecision: autoDecision });
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-10 flex flex-col gap-8 text-left min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl mb-4 font-black text-[#154398] uppercase">
            LỊCH PHỎNG VẤN
          </h1>
          <Text type="secondary" className="font-bold">
            {managerInfo?.deptName} (ID: {managerInfo?.deptId})
          </Text>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <Button
            type="text"
            onClick={() =>
              setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))
            }
            icon={
              <span className="material-symbols-outlined">chevron_left</span>
            }
          />
          <span className="font-bold px-4 uppercase text-[#154398]">
            {viewDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            type="text"
            onClick={() =>
              setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))
            }
            icon={
              <span className="material-symbols-outlined">chevron_right</span>
            }
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CALENDAR */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div
                key={d}
                className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
            {calendarDays.map((item) => {
              const isSelected =
                item.date &&
                dayjs(item.date).isSame(dayjs(selectedDay.date), "day");
              return (
                <div
                  key={item.key}
                  onClick={() => item.type === "day" && setSelectedDay(item)}
                  className={`min-h-[110px] p-2 bg-white hover:bg-blue-50 cursor-pointer relative transition-all ${isSelected ? "ring-2 ring-blue-500 z-10 bg-blue-50" : ""}`}
                >
                  <span
                    className={`text-sm font-bold ${item.date && dayjs(item.date).isSame(dayjs(), "day") ? "bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : "text-slate-700"}`}
                  >
                    {item.day}
                  </span>
                  {item.hasEvent && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full ring-2 ring-white"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6">
          <Card
            className="rounded-2xl shadow-sm border-none bg-white overflow-hidden"
            title={
              <span className="font-bold text-[#154398]">
                Thông tin ứng viên
              </span>
            }
          >
            {loading ? (
              <div className="py-10 text-center">
                <Spin />
              </div>
            ) : candidateInfo ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    className="bg-blue-100 text-blue-600 border-2 border-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Text strong className="text-xl block truncate">
                        {candidateInfo.fullName}
                      </Text>
                      {candidateInfo.status === "Passed" && (
                        <Tag color="success">ĐẠT</Tag>
                      )}
                      {candidateInfo.status === "Rejected" && (
                        <Tag color="error">LOẠI</Tag>
                      )}
                    </div>
                    <div className="flex flex-col mt-1">
                      <Text type="secondary" className="text-[11px]">
                        <MailOutlined className="mr-1" /> {candidateInfo.email}
                      </Text>
                      <Text type="secondary" className="text-[11px]">
                        <PhoneOutlined className="mr-1" /> {candidateInfo.phone}
                      </Text>
                      <Text className="text-[11px] text-blue-600 font-bold mt-1">
                        <SolutionOutlined /> {candidateInfo.jobTitle}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Hiển thị tóm tắt đánh giá nếu đã phỏng vấn xong */}
                {(candidateInfo.status === "Passed" ||
                  candidateInfo.status === "Rejected") && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <Text
                      strong
                      className="text-[11px] text-amber-700 uppercase block mb-1"
                    >
                      Kết quả phỏng vấn
                    </Text>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold">Điểm số:</span>
                      <Tag color="blue">{candidateInfo.score}/10</Tag>
                    </div>
                    <Text className="text-[12px] italic text-slate-600 italic">
                      {candidateInfo.comments}
                    </Text>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    icon={<FilePdfOutlined />}
                    block
                    className="rounded-xl font-bold"
                    onClick={() =>
                      window.open(
                        `https://localhost:7167${candidateInfo.cvUrl}`,
                        "_blank",
                      )
                    }
                  >
                    Xem CV
                  </Button>

                  {/* Chỉ hiện nút Đánh giá nếu trạng thái là Interview */}
                  {candidateInfo.status === "Interview" ? (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      block
                      className="bg-[#154398] rounded-xl font-bold"
                      onClick={() => setIsEvalModalOpen(true)}
                    >
                      Đánh giá
                    </Button>
                  ) : (
                    <Button
                      disabled
                      icon={<CheckCircleOutlined />}
                      block
                      className="rounded-xl font-bold"
                    >
                      Đã đánh giá
                    </Button>
                  )}
                </div>

                <Button
                  type="link"
                  size="small"
                  className="text-slate-400"
                  onClick={() => router.replace(window.location.pathname)}
                >
                  Quay lại danh sách
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {waitingCandidates.length > 0 ? (
                  waitingCandidates.map((item) => (
                    <div
                      key={item.candidateID}
                      className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl mb-2 flex items-center gap-3 bg-white shadow-sm border border-transparent hover:border-blue-200 transition-all"
                      onClick={() =>
                        router.push(`?candidateId=${item.candidateID}`)
                      }
                    >
                      <Avatar
                        icon={<UserOutlined />}
                        className="bg-blue-100 text-blue-600 flex-shrink-0"
                      />
                      <div className="flex flex-col overflow-hidden flex-1">
                        <div className="flex justify-between items-start">
                          <Text
                            strong
                            className="text-sm truncate leading-tight"
                          >
                            {item.fullName}
                          </Text>
                          {renderStatusTag(item.status)}
                        </div>
                        <Text className="text-[10px] text-blue-500 font-medium truncate">
                          {item.jobTitle}
                        </Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có ứng viên chờ phỏng vấn"
                  />
                )}
              </div>
            )}
          </Card>

          <Card
            className="rounded-2xl shadow-sm border-none bg-white flex-1"
            title={
              <span className="font-bold text-slate-700 uppercase text-xs">
                Sự kiện ngày {selectedDay.day}
              </span>
            }
          >
            <div className="space-y-4">
              {dailyInterviews.length > 0 ? (
                dailyInterviews.map((inv, idx) => (
                  <div
                    key={inv.interviewID || idx}
                    className="p-4 border-l-4 border-emerald-500 bg-emerald-50/30 rounded-r-xl transition-all hover:bg-emerald-50 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <Text strong className="text-[#154398] text-sm">
                        {inv.candidateName}
                      </Text>

                      <Tag
                        color="emerald"
                        className="m-0 font-bold text-[10px]"
                      >
                        {dayjs(inv.interviewDate).format("HH:mm")}
                      </Tag>
                    </div>
                    <Text className="text-[11px] block text-slate-500 mt-1">
                      <EnvironmentOutlined /> {inv.location}
                    </Text>
                    <Divider className="my-2" />
                    <Button
                      type="link"
                      size="small"
                      className="p-0 h-auto text-blue-600 font-bold text-[11px]"
                      onClick={() =>
                        router.push(`?candidateId=${inv.candidateID}`)
                      }
                    >
                      XEM CHI TIẾT & ĐÁNH GIÁ
                    </Button>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có lịch"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        title={
          <Title
            level={4}
            className="m-0 text-[#154398] uppercase tracking-tight"
          >
            <AuditOutlined /> Đánh giá phỏng vấn
          </Title>
        }
        open={isEvalModalOpen}
        onCancel={() => setIsEvalModalOpen(false)}
        footer={null}
        centered
        zIndex={2000}
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEvaluation}
          onValuesChange={handleValuesChange}
          className="mt-6"
        >
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center mb-6">
            <div>
              <Text
                type="secondary"
                className="text-[10px] uppercase font-bold block"
              >
                Ứng viên
              </Text>
              <Text strong className="text-lg">
                {candidateInfo?.fullName}
              </Text>
            </div>
            <Form.Item
              name="score"
              label={
                <span className="font-bold text-slate-600">
                  Thang điểm chuyên môn (1-10)
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chấm điểm!" }]}
            >
              <Select placeholder="Chọn điểm số" className="h-11">
                {[...Array(10)].map((_, i) => (
                  <Select.Option key={i + 1} value={i + 1}>
                    <span className="font-bold">{i + 1} Điểm</span>
                    {i + 1 >= 8
                      ? " - Xuất sắc"
                      : i + 1 >= 5
                        ? " - Khá/Trung bình"
                        : " - Không đạt"}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label={<span className="font-bold text-slate-600">Nhận xét</span>}
            name="comment"
            rules={[{ required: true, message: "Nhập nhận xét!" }]}
          >
            <Input.TextArea rows={4} className="rounded-xl" />
          </Form.Item>
          <Form.Item
            label={
              <span className="font-bold text-slate-600">
                Kết quả (Tự động theo điểm)
              </span>
            }
            name="finalDecision"
            rules={[{ required: true }]}
            initialValue="PASS"
          >
            <Select placeholder="Chọn kết quả" className="h-11">
              <Select.Option value="PASS">
                <span className="text-green-600 font-bold">ĐẠT</span>
              </Select.Option>
              <Select.Option value="FAIL">
                <span className="text-red-600 font-bold">LOẠI</span>
              </Select.Option>
            </Select>
          </Form.Item>
          <div className="flex gap-3 mt-8">
            <Button
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setIsEvalModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="flex-1 h-12 rounded-xl bg-[#154398] font-bold"
            >
              Lưu đánh giá
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
