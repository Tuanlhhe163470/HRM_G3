"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dropdown, Avatar, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  IdcardOutlined,
  DownOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileSearchOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { LayoutStyled } from "../styled";
import "../styles.css";
import UseWindowSize from "src/lib/useWindowSize";
import LoginModal from "@/components/Modal/Login/page";
import ContactModal from "@/components/Modal/Contact/page";

export default function Header() {
  const isMobile = UseWindowSize.isMobile();
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoginOpen && mounted) {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    }
  }, [isLoginOpen, mounted]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  // --- HÀM RENDER NAV THEO ROLE ---
  const renderNavByRole = () => {
    if (isMobile) return null;

    // Nếu chưa đăng nhập: Hiện menu mặc định
    if (!user) {
      return (
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/tim-kiem-viec"
            className="menu-item font-medium hover:text-[#00aeef]"
          >
            CÁC CÔNG VIỆC
          </Link>
          <Link
            href="/gioi-thieu-tong-quan"
            className="menu-item font-medium hover:text-[#00aeef]"
          >
            BỘ GIẢI PHÁP
          </Link>
          <Link
            href="/lien-he"
            className="menu-item font-medium hover:text-[#00aeef]"
          >
            VỀ CHÚNG TÔI
          </Link>
        </nav>
      );
    }

    // Logic giả định: Object user của bạn nên có thêm trường roleName từ Backend
    // Nếu chưa có, bạn có thể giải mã token hoặc BE trả về thêm nhé.
    const role = user.roleName || "Employee";

    switch (role) {
      case "Admin":
        return (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/hrm/dashboard"
              className="menu-item font-bold text-[#00aeef]"
            >
              <DashboardOutlined /> TỔNG QUAN
            </Link>
            <Link href="/hrm/accounts" className="menu-item font-medium">
              QUẢN TRỊ TÀI KHOẢN
            </Link>
            <Link href="/hrm/settings" className="menu-item font-medium">
              CẤU HÌNH HỆ THỐNG
            </Link>
          </nav>
        );
      case "HR":
        return (
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/hrm/recruitment" className="menu-item font-semibold text-[#00aeef] text-[13px] uppercase tracking-tighter">
              <FileSearchOutlined /> Tuyển dụng
            </Link>
            <Link href="/hrm/core-hr" className="menu-item font-medium hover:text-[#00aeef] text-[13px] uppercase tracking-tighter">
              <TeamOutlined /> Nhân sự
            </Link>
            <Link href="/hrm/attendance" className="menu-item font-medium hover:text-[#00aeef] text-[13px] uppercase tracking-tighter">
              <DashboardOutlined /> Chấm công
            </Link>
            <Link href="/hrm/payroll" className="menu-item font-medium hover:text-[#00aeef] text-[13px] uppercase tracking-tighter">
              <DollarOutlined /> Lương & Phúc lợi
            </Link>
            <Link href="/hrm/training" className="menu-item font-medium hover:text-[#00aeef] text-[13px] uppercase tracking-tighter">
              <SettingOutlined /> Đào tạo
            </Link>
          </nav>
        );
      case "Manager":
        return (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hrm/team" className="menu-item font-medium">
              ĐỘI NGŨ
            </Link>
            <Link href="/hrm/approvals" className="menu-item font-medium">
              DUYỆT YÊU CẦU
            </Link>
            <Link href="/hrm/reports" className="menu-item font-medium">
              BÁO CÁO
            </Link>
          </nav>
        );
      default: // Employee
        return (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/hrm/attendance"
              className="menu-item font-medium text-[#00aeef]"
            >
              CHẤM CÔNG
            </Link>
            <Link href="/hrm/leave" className="menu-item font-medium">
              NGHỈ PHÉP
            </Link>
            <Link href="/hrm/payslip" className="menu-item font-medium">
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
      onClick: () => router.push("/hrm/profile"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!mounted) {
    return (
      <LayoutStyled>
        <header className="admin-header bg-white shadow-sm h-[65px]"></header>
      </LayoutStyled>
    );
  }

  return (
    <LayoutStyled>
      <header className="admin-header bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
          {/* Logo & Dynamic Nav */}
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

            {/* PHẦN THAY ĐỔI THEO ROLE Ở ĐÂY */}
            {renderNavByRole()}
          </div>

          {/* Authentication Actions (Giữ nguyên giống nhau) */}
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
