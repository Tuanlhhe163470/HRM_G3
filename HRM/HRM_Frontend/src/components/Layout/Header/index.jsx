"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Dropdown, Avatar, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  IdcardOutlined,
  DownOutlined,
  FileSearchOutlined,
  TeamOutlined,
  DashboardOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { LayoutStyled } from "../styled";
import "../styles.css";
import UseWindowSize from "src/lib/useWindowSize";
import LoginModal from "@/components/Modal/Login/page";
import ContactModal from "@/components/Modal/Contact/page";
import Cookies from "js-cookie";

export default function Header() {
  const isMobile = UseWindowSize.isMobile();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoginOpen && mounted) {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = token && userStr ? JSON.parse(userStr) : null;
      setUser((prev) => {
        const prevStr = JSON.stringify(prev);
        const currentStr = JSON.stringify(currentUser);
        return prevStr !== currentStr ? currentUser : prev;
      });
    }
  }, [isLoginOpen, mounted]);

  const handleLogout = () => {
    // Xóa localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Xóa Cookie
    Cookies.remove("token");
    Cookies.remove("role");

    router.push("/");
    router.refresh();
  };

  const renderNavByRole = () => {
    if (isMobile) return null;

    if (!user) {
      return (
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/tim-kiem-viec"
            className="menu-item font-medium hover:text-[#00aeef] text-sm"
          >
            CÁC CÔNG VIỆC
          </Link>
          <Link
            href="/gioi-thieu-tong-quan"
            className="menu-item font-medium hover:text-[#00aeef] text-sm"
          >
            BỘ GIẢI PHÁP
          </Link>
          <Link
            href="/lien-he"
            className="menu-item font-medium hover:text-[#00aeef] text-sm"
          >
            VỀ CHÚNG TÔI
          </Link>
        </nav>
      );
    }

    const role = user.roleName;
    
    switch (role) {
      case "HR":
        return (
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/recruitment"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/recruitment") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <FileSearchOutlined /> Tuyển dụng
            </Link>
            <Link
              href="/core-hr/employees"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/core-hr/employees") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <TeamOutlined /> Nhân sự
            </Link>
            <Link
              href="/attendance/checkin"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/attendance") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <DashboardOutlined /> Chấm công
            </Link>
            <Link
              href="/payroll"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/payroll") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <DollarOutlined /> Lương & Phúc lợi
            </Link>
            <Link
              href="/evaluation"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/training") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <SettingOutlined /> Đào tạo
            </Link>
          </nav>
        );
      case "Admin":
        return (
             <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/admin/manage-account"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/recruitment") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <FileSearchOutlined /> QUẢN LÝ HỆ THỐNG
            </Link>
            <Link
              href="/attendance/checkin"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/attendance") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <DashboardOutlined /> Chấm công
            </Link>
            <Link href="/leave" className="menu-item font-medium text-sm">
              NGHỈ PHÉP
            </Link>
            <Link href="/my-payroll" className="menu-item font-medium text-sm">
              PHIẾU LƯƠNG
            </Link>
            <Link
              href="/evaluation"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/training") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <SettingOutlined /> Đào tạo
            </Link>
          </nav>
          
        );
      case "Manager":
        return (
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/recruitment/job-postings/approval"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/recruitment") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <FileSearchOutlined /> Tuyển dụng
            </Link>
            <Link
              href="/core-hr/manager-list"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/core-hr/manager-list") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <TeamOutlined /> Nhân sự của tôi
            </Link>
            <Link
              href="/attendance/checkin"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/attendance") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <DashboardOutlined /> Chấm công
            </Link>
            <Link
              href="/payroll"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/payroll") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <DollarOutlined /> Lương & Phúc lợi
            </Link>
            <Link
              href="/evaluation"
              className={`menu-item font-medium text-[13px] uppercase tracking-tighter ${pathname.startsWith("/training") ? "text-[#00aeef] font-bold" : ""}`}
            >
              <SettingOutlined /> Đào tạo
            </Link>
          </nav>
        );
      default:
        return (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/attendance"
              className="menu-item font-medium text-[#00aeef] text-sm"
            >
              CHẤM CÔNG
            </Link>
            <Link href="/leave" className="menu-item font-medium text-sm">
              NGHỈ PHÉP
            </Link>
            <Link href="/my-payroll" className="menu-item font-medium text-sm">
              PHIẾU LƯƠNG
            </Link>
          </nav>
        );
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <IdcardOutlined />,
      onClick: () => router.push("/profile"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!mounted)
    return <div className="admin-header bg-white shadow-sm h-[65px]"></div>;

  const getRoleLabel = (role) => {
      switch (role) {
        case "Admin":
          return "Admin";
        case "HR":
          return "HR";
        case "Manager":
          return "Manager";
        case "Employee":
          return "Nhân viên";
        default:
          return role;
      }
    };
    
  return (
    <LayoutStyled>
      <header className="admin-header bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center pointer group">
              <Image
                src="/images/hrm-logo-removebg.png"
                alt="HRM Logo"
                width={isMobile ? 45 : 65}
                height={isMobile ? 45 : 65}
                className="object-contain transition-transform group-hover:scale-105"
              />
              <div className="name-branch ml-3">
                <span
                  className={`font-bold text-lg ${isMobile ? "hidden" : "block"}`}
                >
                  HRM System
                </span>
              </div>
            </Link>
            {renderNavByRole()}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded-lg transition-all">
                  <Avatar
                    style={{ backgroundColor: "#00aeef" }}
                    icon={<UserOutlined />}
                    src={user.avatarURL}
                  />
                  {!isMobile && (
                    <Space className="ml-1">
                      <span className="font-semibold text-gray-700">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] px-2 py-[2px] rounded-full bg-gray-100 text-gray-600 font-medium">
                        {getRoleLabel(user.roleName)}
                      </span>
                      <DownOutlined className="text-xs text-gray-400" />
                    </Space>
                  )}
                </div>
              </Dropdown>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-6 py-2 rounded-full border-2 border-[#00aeef] text-[#00aeef] font-bold hover:bg-[#00aeef] hover:text-white transition-all duration-300 text-sm cursor-pointer"
                >
                  Đăng nhập
                </button>
                {!isMobile && (
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-6 py-2 rounded-full bg-[#00aeef] text-white font-bold hover:bg-[#0096ce] shadow-sm transition-all duration-300 text-sm cursor-pointer"
                  >
                    Liên hệ mua
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <LoginModal open={isLoginOpen} onCancel={() => setIsLoginOpen(false)} />
      <ContactModal
        open={isContactOpen}
        onCancel={() => setIsContactOpen(false)}
      />
    </LayoutStyled>
  );
}
