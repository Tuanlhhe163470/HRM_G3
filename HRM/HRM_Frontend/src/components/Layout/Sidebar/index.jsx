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
  OrderedListOutlined,
  SnippetsOutlined,
  FormOutlined,
  AuditOutlined,
  AccountBookOutlined,
  PieChartOutlined,
  LineChartOutlined
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
    
    if (role === "HR") return [
      {
        key: "sub-jobposting",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Quản lý tin tuyển dụng</span>,
        icon: <FileSearchOutlined />,
        children: [
          { key: "/recruitment/job-postings/new", label: <Link href="/recruitment/job-postings/new">Tạo yêu cầu tuyển dụng</Link>, icon: <PlusCircleOutlined /> },
          { key: "/recruitment/job-postings/list", label: <Link href="/recruitment/job-postings/list">Danh sách yêu cầu</Link>, icon: <UnorderedListOutlined /> },
        ],
      },
      {
        key: "sub-candidate-tracking",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Theo dõi ứng viên</span>,
        icon: <UserOutlined />,
        children: [
          { key: "/recruitment/candidates/list", label: <Link href="/recruitment/candidates/list">Danh sách ứng viên</Link>, icon: <UnorderedListOutlined /> },
          { key: "/recruitment/candidates/shorted-list", label: <Link href="/recruitment/candidates/shorted-list">Danh sách rút gọn</Link>, icon: <SnippetsOutlined /> },
        ],
      },
    ];

    if (role === "Manager") return [
      {
        key: "/recruitment/job-postings/approval",
        label: <Link href="/recruitment/job-postings/approval"><span className="font-bold text-[13px] uppercase tracking-tight">Phê duyệt tin tuyển dụng</span></Link>,
        icon: <FileSearchOutlined />,
      },
      {
        key: "sub-candidate-tracking",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Theo dõi ứng viên</span>,
        icon: <UserOutlined />,
        children: [
          { key: "/recruitment/candidates/manager-review", label: <Link href="/recruitment/candidates/manager-review">Phê duyệt ứng viên</Link>, icon: <FormOutlined /> },
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
    const items = [];

    // 1. SIDEBAR QUẢN LÝ (CHỈ DÀNH CHO MANAGER, HR, ADMIN)
    // Nhân viên (Employee) bình thường sẽ KHÔNG BAO GIỜ nhìn thấy mục này
    if (role !== "Employee") {
      const manageChildren = [
        {
          key: "/payroll/payroll-processing",
          label: <Link href="/payroll/payroll-processing">Xử lý bảng lương</Link>,
          icon: <FileSearchOutlined />,
        },
        {
          key: "/payroll/calculation",
          label: <Link href="/payroll/calculation">Tính lương tự động</Link>,
          icon: <CalculatorFilled />,
        },
        {
          key: "/payroll", 
          label: <Link href="/payroll">Cấu hình lương</Link>,
          icon: <SettingOutlined />,
        },
        {
          key: "/advance-approvals",
          label: <Link href="/advance-approvals">Duyệt ứng lương</Link>,
          icon: <AuditOutlined />,
        },
      ];

      items.push({
        key: "sub-manage-payroll",
        label: <span className="font-bold text-[13px] uppercase tracking-tight">Quản lý Hệ thống</span>,
        icon: <SettingOutlined />,
        children: manageChildren
      });
    }

    // 2. SIDEBAR CÁ NHÂN (AI ĐĂNG NHẬP VÀO CŨNG SẼ THẤY PHẦN NÀY)
    items.push({
      key: "sub-my-payroll",
      label: <span className="font-bold text-[13px] uppercase tracking-tight">Lương & Tạm ứng</span>,
      icon: <DollarOutlined />,
      children: [
        { 
          key: "/my-payroll", 
          label: <Link href="/my-payroll">Phiếu lương của tôi</Link>, 
          icon: <SnippetsOutlined /> 
        },
        { 
          key: "/my-advance", 
          label: <Link href="/my-advance">Xin ứng lương</Link>, 
          icon: <FormOutlined /> 
        },
        { 
          key: "/my-advance-history", 
          label: <Link href="/my-advance-history">Lịch sử ứng lương</Link>, 
          icon: <AccountBookOutlined /> 
        },
      ],
    });

    // 👉 THỐNG KÊ THU NHẬP CÁ NHÂN (Ngay dưới Lương & Tạm ứng, ngang hàng)
    items.push({
      key: "/my-payroll/analytics",
      label: (
        <Link href="/my-payroll/analytics">
          <span className="font-bold text-[13px] uppercase tracking-tight">Thống kê thu nhập</span>
        </Link>
      ),
      icon: <LineChartOutlined />,
    });

    // 3. MỤC PHÂN TÍCH (CHỈ DÀNH CHO MANAGER VÀ ADMIN) - NGANG HÀNG
    if (role === "Manager" || role === "Admin") {
      items.push({
        key: "/payroll/analytics",
        label: (
          <Link href="/payroll/analytics">
            <span className="font-bold text-[13px] uppercase tracking-tight">Phân tích chi phí</span>
          </Link>
        ),
        icon: <PieChartOutlined />,
      });
    }

    return items;
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

  // PHẦN ĐÃ SỬA: Dùng includes để bắt được các link my-advance, advance-approvals và không bị trắng menu
  const getMenuItems = () => {
    const path = (pathname || "").toLowerCase();

    if (path.includes("recruitment") || path.includes("candidate") || path.includes("job-postings")) return getRecruitmentItems();
    if (path.includes("core-hr") || path.includes("employee") || path.includes("department")) return getCoreHRItems();
    if (path.includes("attendance") || path.includes("checkin") || path.includes("timesheet") || path.includes("leave")) return getAttendanceItems();
    
    // Nếu URL có chứa chữ "payroll" HOẶC "advance" -> Load menu Lương
    if (path.includes("payroll") || path.includes("advance")) {
      return getPayrollItems();
    }
    
    if (path.includes("evaluation")) return getEvaluationItems();
    
    // FALLBACK: Tránh lỗi trắng màn hình khi user đứng ở trang chủ (/)
    if (role === "Employee") return getPayrollItems();
    return getCoreHRItems();
  };

  return (
    <div className="sticky top-0 h-screen h-full bg-white border-r border-gray-100 shadow-sm overflow-y-auto">
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        // PHẦN ĐÃ SỬA: Đã thêm các mục Lương để nó tự động mở ra khi vào trang
        defaultOpenKeys={["sub-request", "sub-job", "sub-candidate", "sub-my-attendance", "sub-my-payroll", "sub-manage-payroll"]}
        items={getMenuItems()}
        className="custom-sidebar-menu"
      />
    </div>
  );
}