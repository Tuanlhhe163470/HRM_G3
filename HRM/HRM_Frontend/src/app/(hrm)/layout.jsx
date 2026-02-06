import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { EMPLOYEE_MENU } from '@/constants/menuItems'; // Import menu config

export default function HRMLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. SIDEBAR (Truyền menu items vào) */}
      <Sidebar menuItems={EMPLOYEE_MENU} />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        
        {/* Header nằm trên cùng */}
        <Header />

        {/* Nội dung thay đổi (Dashboard, Profile...) sẽ hiện ở đây */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}