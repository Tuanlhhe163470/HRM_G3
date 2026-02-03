"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutStyled } from "../styled";
import "../styles.css";
import UseWindowSize from "src/lib/useWindowSize";
import LoginModal from "@/components/Modal/Login/page";
import ContactModal from "@/components/Modal/Contact/page";

export default function Header() {
  const isMobile = UseWindowSize.isMobile();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <LayoutStyled>
      <header className="admin-header bg-white">
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
                <span
                  className={`menu-item transition-all hover:text-red-500 font-bold text-lg ${isMobile ? "hidden" : "block"}`}
                >
                  HRM System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/tim-kiem-viec"
                  className="menu-item transition-all hover:text-red-500"
                >
                  CÁC CÔNG VIỆC
                </Link>
                <Link
                  href="/gioi-thieu-tong-quan"
                  className="menu-item transition-all hover:text-red-500"
                >
                  BỘ GIẢI PHÁP HRM
                </Link>
                <Link
                  href="/lien-he"
                  className="menu-item transition-all hover:text-red-500"
                >
                  VỀ CHÚNG TÔI
                </Link>
              </nav>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-4">
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
