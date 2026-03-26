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
  DatePicker,
  Select,
  Input,
  App,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
  MailOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import candidateService from "@/services/Recruitment/candidateService";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function InterviewSchedulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification } = App.useApp();

  const candidateIdFromUrl = searchParams.get("candidateId");

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState({
    day: new Date().getDate(),
    date: new Date(),
  });
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [waitingCandidates, setWaitingCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();

  // 1. Khai báo hàm lấy lịch phỏng vấn (Dùng useCallback để ổn định dependency)
  const fetchInterviews = useCallback(async () => {
    try {
      const res = await candidateService.getAllInterviews();
      setInterviews(res || []);
      return res || [];
    } catch (error) {
      console.error("Lỗi lấy danh sách phỏng vấn:", error);
      return [];
    }
  }, []);

  // 2. Effect chạy 1 lần duy nhất khi trang load: Lấy danh sách phỏng vấn và danh sách chờ
  useEffect(() => {
    fetchInterviews();

    const fetchWaitingList = async () => {
      try {
        const res = await candidateService.getAdminList();
        setWaitingCandidates(res.filter((c) => c.status === "Interview"));
      } catch (error) {
        console.error("Lỗi lấy danh sách chờ:", error);
      }
    };
    fetchWaitingList();
  }, [fetchInterviews]);

  // 3. Effect theo dõi sự thay đổi của candidateId (Nhảy lịch)
  useEffect(() => {
    const handleNavigation = async () => {
      if (!candidateIdFromUrl) {
        setCandidateInfo(null);
        return;
      }

      setLoadingInfo(true);
      try {
        // Lấy đồng thời thông tin và danh sách lịch mới nhất để so khớp
        const [candidateDetail, allInterviews] = await Promise.all([
          candidateService.getById(candidateIdFromUrl),
          fetchInterviews(),
        ]);

        setCandidateInfo(candidateDetail);

        // Tìm lịch hẹn của ứng viên này
        const latestInv = allInterviews
          .filter((inv) => inv.candidateID === parseInt(candidateIdFromUrl))
          .sort(
            (a, b) => new Date(b.interviewDate) - new Date(a.interviewDate),
          )[0];

        if (latestInv) {
          const invDate = new Date(latestInv.interviewDate);
          // Tự động nhảy tháng và chọn ngày
          setViewDate(new Date(invDate.getFullYear(), invDate.getMonth(), 1));
          setSelectedDay({ day: invDate.getDate(), date: invDate });
        }
      } catch (error) {
        notification.error({
          title: "Lỗi",
          description: "Không tải được thông tin ứng viên.",
        });
      } finally {
        setLoadingInfo(false);
      }
    };

    handleNavigation();
  }, [candidateIdFromUrl, fetchInterviews, notification]);

  const checkIsScheduled = (id) =>
    interviews.some((inv) => inv.candidateID === parseInt(id));

  const dailyInterviews = interviews.filter((item) =>
    dayjs(item.interviewDate).isSame(dayjs(selectedDay.date), "day"),
  );

  const handleOpenModal = () => {
    const isScheduled = checkIsScheduled(candidateInfo?.candidateID);

    if (isScheduled) {
      // Tìm lịch hẹn hiện tại của ứng viên này
      const existingInv = interviews.find(
        (inv) => inv.candidateID === parseInt(candidateInfo.candidateID),
      );

      if (existingInv) {
        form.setFieldsValue({
          interviewDate: dayjs(existingInv.interviewDate),
          interviewType: existingInv.interviewType || "Online",
          location: existingInv.location,
          note: existingInv.note,
        });
      }
    } else {
      // Nếu chưa có lịch thì làm sạch form
      form.resetFields();
    }

    setIsModalOpen(true);
  };

  const handleSchedule = async (values) => {
    setLoadingSubmit(true);
    try {
      const payload = {
        candidateID: candidateInfo?.candidateID || values.candidateID,
        interviewDate: values.interviewDate.format("YYYY-MM-DDTHH:mm:ss"),
        interviewType: values.interviewType,
        location: values.location,
        note: values.note,
        interviewerID: 1,
      };

      await candidateService.scheduleInterview(payload);
      notification.success({
        title: "Thành công",
        description: "Đã lưu lịch và gửi mail.",
      });
      setIsModalOpen(false);
      fetchInterviews();
      router.replace("/recruitment/interview/hr-schedule");
    } catch (error) {
      notification.error({ title: "Lỗi", description: "Không thể lưu lịch." });
    } finally {
      setLoadingSubmit(false);
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
      days.push({ type: "empty", key: `empty-${i}`, date: null });
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const hasEvent = interviews.some((inv) =>
        dayjs(inv.interviewDate).isSame(dayjs(date), "day"),
      );
      days.push({ type: "day", key: `day-${i}`, day: i, date: date, hasEvent });
    }
    return days;
  })();

  const disabledDate = (current) => current && current < dayjs().startOf("day");

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-10 flex flex-col gap-8 text-slate-900 text-left">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-[#154398] uppercase">
          Lịch Phỏng Vấn
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))
            }
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-lg font-bold bg-blue-50 px-4 py-1 rounded-md text-blue-700 min-w-[180px] text-center uppercase">
            {viewDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() =>
              setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))
            }
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CALENDAR */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div
                key={d}
                className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
            {calendarDays.map((item) => {
              const isToday =
                item.date && dayjs(item.date).isSame(dayjs(), "day");
              const isSelected =
                item.date &&
                dayjs(item.date).isSame(dayjs(selectedDay.date), "day");
              return (
                <div
                  key={item.key}
                  onClick={() => item.type === "day" && setSelectedDay(item)}
                  className={`min-h-[120px] p-2 bg-white hover:bg-blue-50 cursor-pointer relative transition-all ${isSelected ? "ring-2 ring-blue-500 z-10 bg-blue-50" : ""}`}
                >
                  <span
                    className={`text-sm font-bold ${isToday ? "bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : "text-slate-700"}`}
                  >
                    {item.day}
                  </span>
                  {item.hasEvent && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm"></div>
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
            {loadingInfo ? (
              <div className="py-10 text-center">
                <Spin />
              </div>
            ) : candidateInfo ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    className="bg-blue-100 text-blue-600 border-2 border-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Text
                        strong
                        className="text-xl block leading-tight truncate"
                      >
                        {candidateInfo.fullName}
                      </Text>
                    </div>
                    <div className="flex flex-col mt-1">
                      <Text type="secondary" className="text-xs truncate">
                        <MailOutlined className="mr-1" /> {candidateInfo.email}
                      </Text>
                      <Text type="secondary" className="text-xs truncate">
                        <PhoneOutlined className="mr-1" /> {candidateInfo.phone}
                      </Text>
                      <Text className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                        <SolutionOutlined /> {candidateInfo.jobTitle}
                      </Text>
                    </div>
                  </div>
                </div>
                {!checkIsScheduled(candidateInfo.candidateID) && (
                  <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    className="h-11 rounded-xl font-bold bg-[#154398]"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Thiết lập lịch hẹn
                  </Button>
                )}
                <Button
                  type={
                    checkIsScheduled(candidateInfo.candidateID)
                      ? "default"
                      : "primary"
                  }
                  block
                  icon={
                    checkIsScheduled(candidateInfo.candidateID) ? (
                      <EditOutlined />
                    ) : (
                      <PlusOutlined />
                    )
                  }
                  className={`h-11 rounded-xl font-bold transition-all ${
                    checkIsScheduled(candidateInfo.candidateID)
                      ? "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100"
                      : "bg-[#154398] text-white"
                  }`}
                  onClick={handleOpenModal}
                >
                  {checkIsScheduled(candidateInfo.candidateID)
                    ? "Cập nhật lịch hẹn "
                    : "Thiết lập lịch hẹn"}
                </Button>
                <Button
                  type="link"
                  size="small"
                  className="text-slate-400"
                  onClick={() =>
                    router.replace("/recruitment/interview/hr-schedule")
                  }
                >
                  Chọn ứng viên khác
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {waitingCandidates.length > 0 ? (
                  waitingCandidates.map((item) => {
                    const isScheduled = checkIsScheduled(item.candidateID);
                    return (
                      <div
                        key={item.candidateID}
                        className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl mb-2 flex items-center gap-3 bg-white shadow-sm transition-all"
                        onClick={() =>
                          router.push(`?candidateId=${item.candidateID}`)
                        }
                      >
                        <div className="relative">
                          <Avatar
                            icon={<UserOutlined />}
                            className="bg-blue-100 text-blue-600"
                          />
                          {isScheduled && (
                            <CheckCircleOutlined className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full text-[12px]" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <div className="flex justify-between items-start">
                            <Text
                              strong
                              className="text-sm truncate leading-tight"
                            >
                              {item.fullName}
                            </Text>
                            <Tag
                              color={isScheduled ? "green" : "default"}
                              className="text-[9px] m-0 px-1"
                            >
                              {isScheduled ? "ĐÃ HẸN" : "CHỜ"}
                            </Tag>
                          </div>
                          <div className="flex flex-col mt-0.5">
                            <Text className="text-[10px] text-slate-400">
                              <PhoneOutlined className="mr-1" /> {item.phone}
                            </Text>
                            <Text className="text-[10px] text-blue-500 font-medium truncate">
                              <SolutionOutlined className="mr-1" />{" "}
                              {item.jobTitle}
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có ứng viên"
                  />
                )}
              </div>
            )}
          </Card>

          <Card
            className="rounded-2xl shadow-sm border-none bg-white flex-1"
            title={
              <span className="font-bold text-slate-700">
                Sự kiện ngày {selectedDay?.day}
              </span>
            }
          >
            <div className="space-y-4">
              {dailyInterviews.length > 0 ? (
                dailyInterviews.map((inv, idx) => (
                  <div
                    key={inv.interviewID || idx}
                    className="p-4 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-xl transition-all hover:bg-purple-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <Text
                          strong
                          className="text-sm text-[#154398] block"
                          style={{ maxWidth: "250px" }}
                        >
                          {inv.jobTitle}
                        </Text>
                        <Tag color="purple" className="w-fit text-[10px] mt-1">
                          {inv.interviewType}
                        </Tag>
                      </div>
                      <Text strong className="text-blue-600 text-[12px]">
                        <ClockCircleOutlined />{" "}
                        {dayjs(inv.interviewDate).format("HH:mm")}
                      </Text>
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-100 flex flex-col gap-1">
                      <Text className="text-xs">
                        <UserOutlined className="mr-1" /> Ứng viên:{" "}
                        <strong>{inv.candidateName}</strong>
                      </Text>
                      <Text className="text-[11px] text-slate-500">
                        <PhoneOutlined className="mr-1" /> Liên hệ:{" "}
                        {inv.candidatePhone}
                      </Text>
                      <Text className="text-[11px] text-slate-600 italic">
                        <EnvironmentOutlined className="mr-1" /> Địa điểm:{" "}
                        {inv.location}
                      </Text>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có lịch phỏng vấn"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        title={
          <Title level={4} className="m-0 text-[#154398]">
            {candidateInfo && checkIsScheduled(candidateInfo.candidateID)
              ? "CẬP NHẬT LỊCH PHỎNG VẤN"
              : "LÊN LỊCH PHỎNG VẤN"}
          </Title>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSchedule}
          className="mt-4"
        >
          <Form.Item
            label="Thời gian"
            name="interviewDate"
            rules={[{ required: true, message: "Chọn thời gian!" }]}
          >
            <DatePicker
              showTime
              className="w-full h-11 rounded-xl"
              format="DD/MM/YYYY HH:mm"
              disabledDate={disabledDate}
            />
          </Form.Item>
          <Form.Item
            label="Hình thức"
            name="interviewType"
            initialValue="Online"
          >
            <Select className="h-11">
              <Select.Option value="Online">
                Online (Google Meet/Zoom)
              </Select.Option>
              <Select.Option value="Offline">
                Offline (Tại văn phòng)
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Địa điểm"
            name="location"
            rules={[{ required: true, message: "Nhập địa điểm!" }]}
          >
            <Input
              prefix={<EnvironmentOutlined />}
              className="h-11 rounded-xl"
              placeholder="Link họp hoặc số phòng"
            />
          </Form.Item>
          <div className="flex gap-3 mt-4">
            <Button
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingSubmit}
              className="flex-1 h-12 rounded-xl bg-[#154398] font-bold"
            >
              Lưu & Gửi Mail
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
