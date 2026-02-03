'use client'; // Bắt buộc vì có dùng hook usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ menuItems = [] }) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để active menu

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white dark:bg-slate-800 dark:border-gray-700 transition-all duration-300">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6 dark:border-gray-700">
        <div className="flex items-center justify-center rounded-lg bg-blue-600/10 p-1.5">
          <span className="material-symbols-outlined text-blue-600 text-2xl">grid_view</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ESS Portal</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item, index) => {
          // Kiểm tra xem menu này có đang active không
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-600/10 text-blue-600' 
                  : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}