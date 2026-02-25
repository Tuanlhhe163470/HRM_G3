"use client";

import {
  FileTextOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  TeamOutlined,
  CloseCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import { useState } from "react";
import styles from "./RecruitmentDashboard.module.scss";

export default function RecruitmentDashboard() {
  // Hardcoded data để test giao diện theo yêu cầu của Chiến
  const stats = {
    totalJobs: 12,
    openJobs: 8,
    totalCandidates: 156,
    newCandidates: 24,
    pendingRequisitions: 5,
    upcomingInterviews: 12,
  };

  const recentCandidates = [
    { key: '1', name: 'Nguyễn Văn A', position: 'ReactJS Developer', status: 'New', time: '2 giờ trước' },
    { key: '2', name: 'Trần Thị B', position: 'UI/UX Designer', status: 'Interview', time: '5 giờ trước' },
    { key: '3', name: 'Lê Văn C', position: 'NodeJS Developer', status: 'Hired', time: '1 ngày trước' },
  ];

  const columns = [
    { title: 'Ứng viên', dataIndex: 'name', key: 'name', render: text => <b>{text}</b> },
    { title: 'Vị trí', dataIndex: 'position', key: 'position' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = status === 'Hired' ? 'green' : status === 'Interview' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>
      }
    },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <Card variant="borderless" className={styles.mainCard}>
        <h1>TỔNG HỢP THÔNG TIN TUYỂN DỤNG</h1>
        <p className={styles.dashboardSubtitle}>
          Quản lý hiệu suất tuyển dụng và nguồn ứng viên
        </p>

        {/* Thống kê tổng quan */}
        <h3 className={styles.dashboardCardtitle}>Chỉ số tuyển dụng</h3>
        <Row gutter={[16, 16]} className={styles.statsRow}>
          <Col span={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Tin tuyển dụng đang mở"
                value={stats.openJobs}
                suffix={`/ ${stats.totalJobs}`}
                prefix={<FileSearchOutlined style={{ color: "#00aeef" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Tổng số ứng viên"
                value={stats.totalCandidates}
                prefix={<TeamOutlined style={{ color: "#00aeef" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Yêu cầu chờ duyệt"
                value={stats.pendingRequisitions}
                styles={{ content: { color: '#faad14' } }}
                prefix={<SolutionOutlined style={{ color: "#faad14" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Phỏng vấn sắp tới"
                value={stats.upcomingInterviews}
                prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          {/* Bảng ứng viên mới nhất */}
          <Col span={16}>
            <Card title={<span><RiseOutlined /> Ứng viên mới nộp hồ sơ</span>} className={styles.tableCard}>
              <Table 
                dataSource={recentCandidates} 
                columns={columns} 
                pagination={false} 
                size="middle"
              />
            </Card>
          </Col>

          {/* Trạng thái quy trình (Pipeline) */}
          <Col span={8}>
            <Card title="Quy trình tuyển dụng" className={styles.tableCard}>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><ClockCircleOutlined /> Sàng lọc CV</span>
                <span className={styles.pipelineValue}>45</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><UsergroupAddOutlined /> Đang phỏng vấn</span>
                <span className={styles.pipelineValue}>12</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><CheckCircleOutlined /> Đã gửi Offer</span>
                <span className={styles.pipelineValue}>5</span>
              </div>
              <div className={styles.pipelineItem}>
                <span className={styles.pipelineLabel}><CloseCircleOutlined /> Từ chối</span>
                <span className={styles.pipelineValue}>18</span>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}