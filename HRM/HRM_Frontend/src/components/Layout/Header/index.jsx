"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutStyled } from "../styled";
import "../styles.css";
import UseWindowSize from "src/lib/useWindowSize";

export default function Header() {
  const isMobile = UseWindowSize.isMobile();

  return (
    <LayoutStyled>
      <header className="admin-header bg-white border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
          
          {/* Left Section: Logo & Brand */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center pointer group">
              <Image
                src="/images/hrm-logo-removebg.png"
                alt="HRM Logo"
                width={isMobile ? 45 : 65}
                height={isMobile ? 45 : 65}
                className="object-contain transition-transform group-hover:scale-105"
              />
              <div className="name-branch ml-3 hover-menu">
                <span className={`menu-item transition-all hover:text-red-500 font-bold text-lg ${isMobile ? "hidden" : "block"}`}>
                  HRM System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/tim-kiem-viec" className="menu-item transition-all hover:text-red-500">
                  Các công việc
                </Link>
                <Link href="/gioi-thieu-tong-quan" className="menu-item transition-all hover:text-red-500">
                  Bộ giải pháp HRM
                </Link>
                <Link href="/lien-he" className="menu-item transition-all hover:text-red-500">
                  Về chúng tôi
                </Link>
              </nav>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="px-6 py-2 rounded-full border-2 border-[#154398] text-[#154398] font-bold hover:bg-[#154398] hover:text-white transition-all duration-300 text-sm"
            >
              Đăng nhập
            </Link>
            {!isMobile && (
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full bg-[#ed1117] text-white font-bold hover:bg-[#c40e14] shadow-md transition-all duration-300 text-sm"
              >
                Liên hệ mua
              </Link>
            )}
          </div>
        </div>
      </header>
    </LayoutStyled>
  );
}