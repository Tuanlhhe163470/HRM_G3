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

  // Trạng thái xác định đã mount thành công trên Client
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  // Bước 1: Khởi tạo dữ liệu và xác nhận mount trong cùng một Effect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // Batching: React sẽ nhóm việc cập nhật mounted và user lại để render 1 lần
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

  // Bước 2: Đồng bộ lại User khi LoginModal đóng
  useEffect(() => {
    const syncData = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const currentUser = JSON.parse(userStr);
          setUser(currentUser);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Chỉ chạy logic đồng bộ khi Modal đăng nhập vừa được đóng lại
    if (!isLoginOpen && mounted) {
      syncData();
    }
  }, [isLoginOpen, mounted]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
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

  // Fix Hydration: Trả về khung Header trống (Skeleton) khi đang render ở Server
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
          {/* Logo & Brand */}
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

            {!isMobile && (
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
                  BỘ GIẢI PHÁP HRM
                </Link>
                <Link
                  href="/lien-he"
                  className="menu-item font-medium hover:text-[#00aeef]"
                >
                  VỀ CHÚNG TÔI
                </Link>
              </nav>
            )}
          </div>

          {/* Authentication Actions */}
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
