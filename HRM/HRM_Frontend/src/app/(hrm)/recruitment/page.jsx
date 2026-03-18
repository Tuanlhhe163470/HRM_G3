"use client";

import React, { useEffect, useState } from "react";
import {
  UsergroupAddOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  HourglassOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag, Spin, App, Typography } from "antd";
import styles from "./RecruitmentDashboard.module.scss";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import candidateService from "@/services/Recruitment/candidateService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

const { Text, Title } = Typography;

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function RecruitmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    pendingRequisitions: 0,
    needSchedule: 0, // Lịch hẹn cần lên
    needOffer: 0,     // Thư mời cần gửi
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [pipeline, setPipeline] = useState({
    screening: 0,
    pendingReview: 0, 
    interview: 0,
    rejected: 0,
  });

  const { notification } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allJobs, allCandidates, allInterviews] = await Promise.all([
        jobPostingService.getAll(),
        candidateService.getAdminList(),
        candidateService.getAllInterviews(),
      ]);

      // 1. Xử lý logic Công việc
      const jobs = Array.isArray(allJobs) ? allJobs : allJobs.data || [];
      const totalJobsCount = jobs.length;
      const openJobsCount = jobs.filter(j => j.status === "Open").length;
      const pendingJobsCount = jobs.filter(j => j.status === "Pending").length;

      // 2. Xử lý logic Ứng viên & Phỏng vấn
      const candidates = Array.isArray(allCandidates) ? allCandidates : [];
      const interviews = Array.isArray(allInterviews) ? allInterviews : [];

      // Tính toán 4 chỉ số thống kê chính
      const needScheduleCount = candidates.filter(c => 
        c.status === "Interview" && !interviews.some(i => i.candidateID === c.candidateID)
      ).length;

      const needOfferCount = candidates.filter(c => c.status === "Passed").length;

      // Tính toán Pipeline
      const screeningCount = candidates.filter(c => c.status === "Screening").length;
      const pendingReviewCount = candidates.filter(c => c.status === "Manager_Review").length;
      const interviewCount = candidates.filter(c => c.status === "Interview").length;
      const rejectedCount = candidates.filter(c => ["Rejected", "Fail"].includes(c.status)).length;

      const latest = [...candidates]
        .filter(c => c.status === "Applied")
        .sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())
        .slice(0, 5);

      setStats({
        totalJobs: totalJobsCount,
        openJobs: openJobsCount,
        pendingRequisitions: pendingJobsCount,
        needSchedule: needScheduleCount,
        needOffer: needOfferCount,
      });

      setRecentCandidates(latest);
      
      setPipeline({
        screening: screeningCount,
        pendingReview: pendingReviewCount,
        interview: interviewCount,
        rejected: rejectedCount,
      });

    } catch (error) {
      notification.error({
        title: "Lỗi tải dữ liệu",
        description: "Không thể cập nhật bảng điều khiển.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { 
      title: "Ứng viên", 
      dataIndex: "fullName", 
      render: (text) => <Text strong className="text-[#154398]">{text}</Text> 
    },
    { 
      title: "Vị trí", 
      dataIndex: "jobTitle", 
      render: (t) => <Text type="secondary" className="text-[11px]">{t}</Text> 
    },
    { 
      title: "Thời gian", 
      dataIndex: "createdAt", 
      render: (d) => dayjs(d).fromNow() 
    },
  ];

  if (loading) return (
    <div className="p-40 text-center flex flex-col items-center gap-4">
      <Spin size="large" />
      <Text type="secondary">Đang tải dữ liệu hệ thống...</Text>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <Card variant="borderless" className={styles.mainCard}>
        <Title level={3} className="text-[#154398] uppercase font-black">Tổng hợp thông tin tuyển dụng</Title>
        <Text type="secondary" className="block mb-6 italic">Dữ liệu tính đến: {dayjs().format("HH:mm:ss DD/MM/YYYY")}</Text>

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card className={styles.statCard} hoverable>
              <Statistic 
                title="Tin đang mở" 
                value={stats.openJobs} 
                suffix={`/ ${stats.totalJobs}`} 
                styles={{ content: { color: '#00aeef' } }} 
                prefix={<FileSearchOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard} hoverable>
              <Statistic 
                title="Tin chờ duyệt" 
                value={stats.pendingRequisitions} 
                styles={{ content: { color: '#faad14' } }} 
                prefix={<SolutionOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard} hoverable>
              <Statistic 
                title="Lịch hẹn cần lên" 
                value={stats.needSchedule} 
                styles={{ content: { color: '#722ed1' } }} 
                prefix={<CalendarOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard} hoverable>
              <Statistic 
                title="Thư mời cần gửi" 
                value={stats.needOffer} 
                styles={{ content: { color: '#52c41a' } }} 
                prefix={<SendOutlined />} 
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={16}>
            <Card title={<Text strong className="text-[#154398]"><RiseOutlined /> Hồ sơ mới chưa xử lý</Text>} className={styles.tableCard}>
              <Table dataSource={recentCandidates} columns={columns} pagination={false} size="small" rowKey="candidateID" />
            </Card>
          </Col>

          <Col span={8}>
            <Card title={<Text strong className="text-[#154398]">Quy trình tuyển dụng</Text>} className={styles.tableCard}>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><ClockCircleOutlined /> Đang lọc hồ sơ</span>
                <span className={styles.pipelineValue}>{pipeline.screening}</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><HourglassOutlined /> Đang chờ duyệt</span>
                <span className={styles.pipelineValue} style={{ color: '#faad14' }}>{pipeline.pendingReview}</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><UsergroupAddOutlined /> Phỏng vấn</span>
                <span className={styles.pipelineValue}>{pipeline.interview}</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><CloseCircleOutlined /> Hồ sơ loại</span>
                <span className={styles.pipelineValue} style={{ color: '#ff4d4f' }}>{pipeline.rejected}</span>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}