"use client";

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
} from "@ant-design/icons";

export default function SidebarHRM() {
  const pathname = usePathname();

  const getRecruitmentItems = () => [
    {
      key: "sub-request",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Yêu cầu tuyển dụng
        </span>
      ),
      icon: <FileAddOutlined />,
      children: [
        {
          key: "/recruitment/request/new",
          label: <Link href="/recruitment/request/new">Tạo yêu cầu mới</Link>,
          icon: <PlusCircleOutlined />,
        },
        {
          key: "/recruitment/request/list",
          label: (
            <Link href="/recruitment/request/list">Danh sách yêu cầu</Link>
          ),
          icon: <UnorderedListOutlined />,
        },
      ],
    },
    {
      key: "sub-job",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Đăng tin tuyển dụng
        </span>
      ),
      icon: <FileSearchOutlined />,
      children: [
        {
          key: "/recruitment/jobs/new",
          label: <Link href="/recruitment/jobs/new">Tạo tin tuyển dụng</Link>,
          icon: <PlusCircleOutlined />,
        },
        {
          key: "/recruitment/jobs/list",
          label: <Link href="/recruitment/jobs/list">Xem các tin đã đăng</Link>,
          icon: <UnorderedListOutlined />,
        },
      ],
    },
    {
      key: "sub-candidate",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Theo dõi ứng viên
        </span>
      ),
      icon: <UserOutlined />,
      children: [
        {
          key: "/recruitment/candidates",
          label: <Link href="/recruitment/candidates">Danh sách ứng viên</Link>,
          icon: <UnorderedListOutlined />,
        },
        {
          key: "/recruitment/interviews",
          label: <Link href="/recruitment/interviews">Lịch phỏng vấn</Link>,
          icon: <CalendarOutlined />,
        },
      ],
    },
  ];

  const getCoreHRItems = () => [
    {
      key: "/core-hr/employees",
      label: (
        <Link href="/core-hr/employees">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Quản lý nhân viên
          </span>
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      key: "/core-hr/departments",
      label: (
        <Link href="/core-hr/departments">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Phòng ban
          </span>
        </Link>
      ),
      icon: <TeamOutlined />,
    },
  ];

  const getAttendanceItems = () => [
    {
      key: "/attendance/checkin",
      label: (
        <Link href="/attendance/checkin">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Chấm công
          </span>
        </Link>
      ),
      icon: <FileAddOutlined />,
    },
    {
      key: "sub-candidate",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Quản lý chấm công
        </span>
      ),
      icon: <UserOutlined />,
      children: [
        {
          key: "/attendance/my-timesheet",
          label: (
            <Link href="/attendance/my-timesheet">Bảng chấm công cá nhân</Link>
          ),
          icon: <CalendarOutlined />,
        },
        {
          key: "/attendance/overtime",
          label: <Link href="/attendance/overtime">Đăng ký OT</Link>,
          icon: <CalendarOutlined />,
        },
      ],
    },
    {
      key: "/attendance/config",
      label: (
        <Link href="/attendance/config">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Cấu hình chấm công
          </span>
        </Link>
      ),
      icon: <CalendarOutlined />,
    },
  ];

  const getPayrollItems = () => [
    {
      key: "/payroll/salary-components",
      label: (
        <Link href="/payroll/salary-components">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Cấu hình lương
          </span>
        </Link>
      ),
      icon: <DollarOutlined />,
    },
    {
      key: "/payroll/payroll-processing",
      label: (
        <Link href="/payroll/payroll-processing">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Xử lý lương
          </span>
        </Link>
      ),
      icon: <FileSearchOutlined />,
    },
  ];

  const getEvaluationItems = () => [
    {
      key: "/evaluation/training",
      label: (
        <Link href="/evaluation/training">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Đào tạo
          </span>
        </Link>
      ),
      icon: <SettingOutlined />,
    },
    {
      key: "/evaluation/performance",
      label: (
        <Link href="/evaluation/performance">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Đánh giá hiệu suất
          </span>
        </Link>
      ),
      icon: <FileSearchOutlined />,
    },
  ];

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
        defaultOpenKeys={["sub-request", "sub-job", "sub-candidate"]}
        items={getMenuItems()}
        className="custom-sidebar-menu"
      />
    </div>
  );
}
