import React from 'react';

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:bg-slate-800 dark:border-gray-700">
      {/* Search Bar */}
      <div className="flex w-full max-w-md items-center rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
        <span className="material-symbols-outlined text-slate-500">search</span>
        <input 
          className="ml-2 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white" 
          placeholder="Search..." 
          type="text" 
        />
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-6">
        <button className="relative rounded-full p-1.5 text-slate-500 hover:bg-gray-100 dark:text-gray-400">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Nguyen Van A</p>
            <p className="text-xs text-slate-500">Senior Developer</p>
          </div>
          <div 
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-200" 
            style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=12')", backgroundSize: 'cover' }}
          ></div>
        </div>
      </div>
    </header>
  );
}