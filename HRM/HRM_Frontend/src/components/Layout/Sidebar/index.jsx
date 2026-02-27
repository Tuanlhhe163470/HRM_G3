"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "antd";
import {
  FileAddOutlined,
  FileSearchOutlined,
  UserOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  TableOutlined,
  CalculatorFilled,
  AuditOutlined
} from "@ant-design/icons";

export default function SidebarHRM() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  const [isMounted, setIsMounted] = useState(false);

  // Lấy thông tin user từ localStorage để phân quyền
  useEffect(() => {
    // Chỉ chạy ở môi trường Client
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }
    // Bật cờ đã mount xong
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full bg-white border-r border-gray-100 shadow-sm" />;

  const role = user?.roleName || "Employee";

  // --- MODULE TUYỂN DỤNG ---
  const getRecruitmentItems = () => {
    if (role === "Employee") return []; 
    
    return [
      {
        key: "sub-request",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Yêu cầu tuyển dụng</span>,
        icon: <FileAddOutlined />,
        children: [
          { key: "/recruitment/request/new", label: <Link href="/recruitment/request/new">Tạo yêu cầu mới</Link>, icon: <PlusCircleOutlined /> },
          { key: "/recruitment/request/list", label: <Link href="/recruitment/request/list">Danh sách yêu cầu</Link>, icon: <UnorderedListOutlined /> },
        ],
      },
      {
        key: "sub-job",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Đăng tin tuyển dụng</span>,
        icon: <FileSearchOutlined />,
        children: [
          { key: "/recruitment/jobs/new", label: <Link href="/recruitment/jobs/new">Tạo tin tuyển dụng</Link>, icon: <PlusCircleOutlined /> },
          { key: "/recruitment/jobs/list", label: <Link href="/recruitment/jobs/list">Xem các tin đã đăng</Link>, icon: <UnorderedListOutlined /> },
        ],
      },
      {
        key: "sub-candidate",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Theo dõi ứng viên</span>,
        icon: <UserOutlined />,
        children: [
          { key: "/recruitment/candidates", label: <Link href="/recruitment/candidates">Danh sách ứng viên</Link>, icon: <UnorderedListOutlined /> },
          { key: "/recruitment/interviews", label: <Link href="/recruitment/interviews">Lịch phỏng vấn</Link>, icon: <CalendarOutlined /> },
        ],
      },
    ];
  };

  // --- MODULE NHÂN SỰ ---
  const getCoreHRItems = () => {
    if (role === "Employee") return []; 
    
    return [
      {
        key: "/core-hr/employees",
        label: <Link href="/core-hr/employees"><span className="font-bold text-[13px] uppercase tracking-tight">Quản lý nhân viên</span></Link>,
        icon: <UserOutlined />,
      },
      {
        key: "/core-hr/departments",
        label: <Link href="/core-hr/departments"><span className="font-bold text-[13px] uppercase tracking-tight">Phòng ban</span></Link>,
        icon: <TeamOutlined />,
      },
    ];
  };

  // --- MODULE CHẤM CÔNG ---
  const getAttendanceItems = () => {
    const items = [];

    // 1. Chấm công (Dành cho mọi nhân viên)
    items.push({
      key: "/attendance/checkin",
      label: <Link href="/attendance/checkin"><span className="font-bold text-[13px] uppercase tracking-tight">Chấm công</span></Link>,
      icon: <FileAddOutlined />,
    });

    // 2. Quản lý cá nhân (Dành cho mọi nhân viên)
    items.push({
      key: "sub-my-attendance",
      label: <span className="font-bold text-[13px] uppercase tracking-tight">Quản lý cá nhân</span>,
      icon: <UserOutlined />,
      children: [
        { key: "/attendance/my-timesheet", label: <Link href="/attendance/my-timesheet">Bảng chấm công</Link>, icon: <CalendarOutlined /> },
        { key: "/attendance/overtime", label: <Link href="/attendance/overtime">Đăng ký OT</Link>, icon: <ClockCircleOutlined /> },
        { key: "/attendance/leave-request", label: <Link href="/attendance/leave-request">Nghỉ phép</Link>, icon: <AuditOutlined /> },
      ],
    });

    // 3. --- THÊM MỚI: TRUNG TÂM PHÊ DUYỆT (Dành cho Manager & HR) ---
    if (role === "Manager" || role === "HR" || role === "Admin") {
      items.push({
        key: "sub-approval-center",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Trung tâm phê duyệt</span>,
        icon: <AuditOutlined/>,
        children: [
          { 
            key: "/attendance/approvals/explanations", 
            label: <Link href="/attendance/approvals/explanations">Duyệt giải trình</Link>, 
            icon: <FileSearchOutlined /> 
          },
          { 
            key: "/attendance/approvals/leaves", 
            label: <Link href="/attendance/approvals/leaves">Duyệt nghỉ phép</Link>, 
            icon: <FileSearchOutlined /> 
          },
        ],
      });
    }

    // 4. Quản lý toàn công ty (Dành cho HR/Admin)
    if (role === "Admin" || role === "HR") {
      items.push({
        key: "sub-company-attendance",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Quản lý toàn công ty</span>,
        icon: <TeamOutlined />,
        children: [
          { 
            key: "/attendance/company-timesheet",
            label: <Link href="/attendance/company-timesheet">Bảng công tổng hợp</Link>, 
            icon: <TableOutlined /> 
          },
        ],
      });

      items.push({
        key: "/attendance/config",
        label: <Link href="/attendance/config"><span className="font-bold text-[13px] uppercase tracking-tight">Cấu hình chấm công</span></Link>,
        icon: <SettingOutlined />,
      });
    }

    return items;
  };

  // --- MODULE LƯƠNG ---
  const getPayrollItems = () => {
    if (role === "Employee") return [];
    
    return [
      {
        // Key này phải khớp với URL thực tế để menu sáng màu xanh khi bạn đang ở trang đó
        key: "/payroll", 
        label: (
          <Link href="/payroll">
            <span className="font-bold text-[13px] uppercase tracking-tight">Cấu hình lương</span>
          </Link>
        ),
        icon: <DollarOutlined />,
      },
      {
        key: "/payroll/payroll-processing",
        label: (
          <Link href="/payroll/payroll-processing">
            <span className="font-bold text-[13px] uppercase tracking-tight">Xử lý lương</span>
          </Link>
        ),
        icon: <FileSearchOutlined />,
      },
      {
        key: "/payroll/calculation",
        label: (
          <Link href="/payroll/calculation">
            <span className="font-bold text-[13px] uppercase tracking-tight">Tính lương</span>
          </Link>
        ),
        icon: <CalculatorFilled />,
      },
    ];
  };

  // --- MODULE ĐÀO TẠO & ĐÁNH GIÁ ---
  const getEvaluationItems = () => {
    return [
      {
        key: "/evaluation/training",
        label: <Link href="/evaluation/training"><span className="font-bold text-[13px] uppercase tracking-tight">Đào tạo</span></Link>,
        icon: <SettingOutlined />,
      },
      {
        key: "/evaluation/performance",
        label: <Link href="/evaluation/performance"><span className="font-bold text-[13px] uppercase tracking-tight">Đánh giá hiệu suất</span></Link>,
        icon: <FileSearchOutlined />,
      },
    ];
  };

  const getMenuItems = () => {
    if (pathname.startsWith("/recruitment")) return getRecruitmentItems();
    if (pathname.startsWith("/core-hr")) return getCoreHRItems();
    if (pathname.startsWith("/attendance")) return getAttendanceItems();
    if (pathname.startsWith("/payroll")) return getPayrollItems();
    if (pathname.startsWith("/evaluation")) return getEvaluationItems();
    return [];
  };

  return (
    <div className="h-full bg-white border-r border-gray-100 shadow-sm overflow-y-auto">
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={["sub-request", "sub-job", "sub-candidate", "sub-my-attendance"]}
        items={getMenuItems()}
        className="custom-sidebar-menu"
      />
    </div>
  );
}