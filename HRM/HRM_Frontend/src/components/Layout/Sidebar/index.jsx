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
  CheckOutlined,
  AccountBookOutlined,
  ApartmentOutlined,
  BankOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FileExcelOutlined
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

  if (!isMounted)
    return (
      <div className="h-full bg-white border-r border-gray-100 shadow-sm" />
    );

  const role = user?.roleName || "Employee";

  // --- MODULE TUYỂN DỤNG ---
  const getRecruitmentItems = () => {
    if (role === "Employee") return [];

    if (role === "HR")
      return [
        {
          key: "job-posting",
          label: (
            <span className="font-bold text-[13px] uppercase tracking-tight">
              Quản lý tin tuyển dụng
            </span>
          ),
          icon: <FileSearchOutlined />,
          children: [
            {
              key: "/recruitment/job-postings/new",
              label: (
                <Link href="/recruitment/job-postings/new">
                  Tạo yêu cầu tuyển dụng
                </Link>
              ),
              icon: <PlusCircleOutlined />,
            },
            {
              key: "/recruitment/job-postings/list",
              label: (
                <Link href="/recruitment/job-postings/list">
                  Danh sách yêu cầu
                </Link>
              ),
              icon: <UnorderedListOutlined />,
            },
          ],
        },
        {
          key: "/recruitment/candidates/list",
          label: (
            <Link href="/recruitment/candidates/list">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Theo dõi ứng viên
              </span>
            </Link>
          ),
          icon: <UserOutlined />,
        },
        {
          key: "/recruitment/interview/hr-schedule",
          label: (
            <Link href="/recruitment/interview/hr-schedule">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Hẹn lịch phỏng vấn
              </span>
            </Link>
          ),
          icon: <CalendarOutlined />,
        },
        {
          key: "offer",
          label: (
            <span className="font-bold text-[13px] uppercase tracking-tight">
              Thư mời làm việc
            </span>
          ),
          icon: <SnippetsOutlined />,
          children: [
            {
              key: "/recruitment/offer/create",
              label: <Link href="/recruitment/offer/create">Tạo thư mời</Link>,
              icon: <PlusCircleOutlined />,
            },
            {
              key: "/recruitment/offer/list",
              label: (
                <Link href="/recruitment/offer/list">Danh sách thư mời</Link>
              ),
              icon: <OrderedListOutlined />,
            },
          ],
        },
      ];

    if (role === "Manager")
      return [
        {
          key: "/recruitment/job-postings/approval",
          label: (
            <Link href="/recruitment/job-postings/approval">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Phê duyệt tin tuyển dụng
              </span>
            </Link>
          ),
          icon: <FileSearchOutlined />,
        },
        {
          key: "sub-candidate-tracking",
          label: (
            <span className="font-bold text-[13px] uppercase tracking-tight">
              Theo dõi ứng viên
            </span>
          ),
          icon: <UserOutlined />,
          children: [
            {
              key: "/recruitment/candidates/manager-review",
              label: (
                <Link href="/recruitment/candidates/manager-review">
                  Phê duyệt ứng viên
                </Link>
              ),
              icon: <FormOutlined />,
            },
            {
              key: "/recruitment/interview/manager-schedule",
              label: (
                <Link href="/recruitment/interview/manager-schedule">
                  Lịch phỏng vấn của tôi
                </Link>
              ),
              icon: <CalendarOutlined />,
            },
            {
              key: "/recruitment/interview/manager-list-result",
              label: (
                <Link href="/recruitment/interview/manager-list-result">
                  Kết quả phỏng vấn
                </Link>
              ),
              icon: <CheckOutlined />,
            },
          ],
        },
      ];
  };

  // --- MODULE NHÂN SỰ ---
  const getCoreHRItems = () => {
    if (role === "Employee") return [];

    if (role === "HR")
      return [
        {
          key: "/core-hr/employees",
          label: (
            <Link href="/core-hr/employees">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Nhân sự công ty
              </span>
            </Link>
          ),
          icon: <TeamOutlined />,
        },
        {
          key: "/core-hr/labor-contracts",
          label: (
            <Link href="/core-hr/labor-contracts">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Quản lý hợp đồng
              </span>
            </Link>
          ),
          icon: <FormOutlined />,
        },
      ];

    if (role === "Manager")
     return [
        {
          key: "/core-hr/manager-list",
          label: (
            <Link href="/core-hr/manager-list">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Nhân sự của tôi
              </span>
            </Link>
          ),
          icon: <TeamOutlined />,
        },
      ]

    if (role === "Admin")
      return [
        {
          key: "/admin/manage-account",
          label: (
            <Link href="/admin/manage-account">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Quản lý tài khoản
              </span>
            </Link>
          ),
          icon: <UserOutlined />,
        },
        {
          key: "/admin/manage-department",
          label: (
            <Link href="/admin/manage-department">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Quản lý phòng ban
              </span>
            </Link>
          ),
          icon: <BankOutlined />,
        },
          {
          key: "/admin/manage-position",
          label: (
            <Link href="/admin/manage-position">
              <span className="font-bold text-[13px] uppercase tracking-tight">
                Quản lý vị trí
              </span>
            </Link>
          ),
          icon: <ApartmentOutlined />,
        },
      ];
  };

  // --- MODULE CHẤM CÔNG ---
  const getAttendanceItems = () => {
    const items = [];

    // 1. Chấm công (Dành cho mọi nhân viên)
    items.push({
      key: "/attendance/checkin",
      label: (
        <Link href="/attendance/checkin">
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Chấm công
          </span>
        </Link>
      ),
      icon: <FileAddOutlined />,
    });

    // 2. Quản lý cá nhân (Dành cho mọi nhân viên)
    items.push({
      key: "sub-my-attendance",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Quản lý cá nhân
        </span>
      ),
      icon: <UserOutlined />,
      children: [
        { key: "/attendance/my-timesheet", label: <Link href="/attendance/my-timesheet">Bảng chấm công</Link>, icon: <CalendarOutlined /> },
        { key: "/attendance/explanation", label: <Link href="/attendance/explanation">Giải trình chấm công</Link>, icon: <AuditOutlined /> },
        { key: "/attendance/overtime", label: <Link href="/attendance/overtime">Đăng ký OT</Link>, icon: <ClockCircleOutlined /> },
        { key: "/attendance/leave-request", label: <Link href="/attendance/leave-request">Nghỉ phép</Link>, icon: <AuditOutlined /> },
      ],
    });

    // 3. --- THÊM MỚI: TRUNG TÂM PHÊ DUYỆT (Dành cho Manager & HR) ---
    if (role === "Manager" || role === "HR" || role === "Admin") {
      items.push({
        key: "sub-approval-center",
        label: (
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Trung tâm phê duyệt
          </span>
        ),
        icon: <AuditOutlined />,
        children: [
          {
            key: "/attendance/approvals/explanations",
            label: (
              <Link href="/attendance/approvals/explanations">
                Duyệt giải trình
              </Link>
            ),
            icon: <FileSearchOutlined />,
          },
          {
            key: "/attendance/approvals/leaves",
            label: (
              <Link href="/attendance/approvals/leaves">Duyệt nghỉ phép</Link>
            ),
            icon: <FileSearchOutlined />,
          },
          {
            key: "/attendance/approvals/overtime",
            label: <Link href="/attendance/approvals/overtime">Duyệt OT</Link>,
            icon: <FileSearchOutlined />
          },
        ],
      });
    }

    // 4. Quản lý toàn công ty (Dành cho HR/Admin)
    if (role === "Admin" || role === "HR") {
      items.push({
        key: "sub-company-attendance",
        label: (
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Quản lý toàn công ty
          </span>
        ),
        icon: <TeamOutlined />,
        children: [
          {
            key: "/attendance/company-timesheet",
            label: (
              <Link href="/attendance/company-timesheet">
                Bảng công tổng hợp
              </Link>
            ),
            icon: <TableOutlined />,
          },
          // Menu 2: Quản lý quỹ nghỉ phép (Object thứ hai)
          {
            key: "/attendance/leave-balances",
            label: <Link href="/attendance/leave-balances">Quản lý quỹ nghỉ phép</Link>,
            // Gợi ý: Bạn có thể đổi icon này thành <CalendarOutlined /> hoặc <AppstoreOutlined /> cho đỡ trùng với icon Bảng công
            icon: <TableOutlined />
          }
        ],
      });

      items.push({
        key: "/attendance/config",
        label: (
          <Link href="/attendance/config">
            <span className="font-bold text-[13px] uppercase tracking-tight">
              Cấu hình chấm công
            </span>
          </Link>
        ),
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
        }
      ];

      if (role !== "Manager") {
        manageChildren.push({
          key: "/payroll/calculation",
          label: <Link href="/payroll/calculation">Tính lương tự động</Link>,
          icon: <CalculatorFilled />,
        });
        manageChildren.push({
          key: "/payroll", 
          label: <Link href="/payroll">Cấu hình lương</Link>,
          icon: <SettingOutlined />,
        });
      }

      manageChildren.push({
        key: "/advance-approvals",
        label: <Link href="/advance-approvals">Duyệt ứng lương</Link>,
        icon: <AuditOutlined />,
      });

      items.push({
        key: "sub-manage-payroll",
        label: (
          <span className="font-bold text-[13px] uppercase tracking-tight">
            Quản lý Hệ thống
          </span>
        ),
        icon: <SettingOutlined />,
        children: manageChildren
      });
    }

    // 2. SIDEBAR CÁ NHÂN (AI ĐĂNG NHẬP VÀO CŨNG SẼ THẤY PHẦN NÀY)
    items.push({
      key: "sub-my-payroll",
      label: (
        <span className="font-bold text-[13px] uppercase tracking-tight">
          Lương & Tạm ứng
        </span>
      ),
      icon: <DollarOutlined />,
      children: [
        {
          key: "/my-payroll",
          label: <Link href="/my-payroll">Phiếu lương của tôi</Link>,
          icon: <SnippetsOutlined />,
        },
        {
          key: "/my-advance",
          label: <Link href="/my-advance">Xin ứng lương</Link>,
          icon: <FormOutlined />,
        },
        {
          key: "/my-advance-history",
          label: <Link href="/my-advance-history">Lịch sử ứng lương</Link>,
          icon: <AccountBookOutlined />,
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


    // BÁO CÁO THUẾ & BH (CHỈ ADMIN VÀ HR MỚI NHÌN THẤY) - NGANG HÀNG
      if (role === "Admin" || role === "HR") {
        items.push({
          key: "/reports/tax-insurance",
          label: <Link href="/reports/tax-insurance"><span className="font-bold text-[13px] uppercase tracking-tight">Báo cáo Thuế & BH</span></Link>,
          icon: <FileExcelOutlined />,
        });
      }
    return items;
  };
  // --- MODULE ĐÀO TẠO & ĐÁNH GIÁ ---
  const getEvaluationItems = () => {
    return [
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
  };

  // PHẦN ĐÃ SỬA: Dùng includes để bắt được các link my-advance, advance-approvals và không bị trắng menu
  const getMenuItems = () => {
    const path = (pathname || "").toLowerCase();

    if (
      path.includes("recruitment") ||
      path.includes("candidate") ||
      path.includes("job-postings")
    )
      return getRecruitmentItems();
    if (
      path.includes("core-hr") ||
      path.includes("employee") ||
      path.includes("department")
    )
      return getCoreHRItems();
    if (
      path.includes("attendance") ||
      path.includes("checkin") ||
      path.includes("timesheet") ||
      path.includes("leave")
    )
      return getAttendanceItems();

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
        defaultOpenKeys={[
          "job-posting",
          "offer",
          "/recruitment/candidates/list",
          "sub-candidate-tracking",
          "sub-my-attendance",
          "sub-my-payroll",
          "sub-manage-payroll",
        ]}
        items={getMenuItems()}
        className="custom-sidebar-menu"
      />
    </div>
  );
}
