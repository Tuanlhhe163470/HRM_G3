import React from 'react';

export default function EmployeeDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* --- SECTION 1: HERO CHECK-IN --- */}
      <div className="relative overflow-hidden rounded-xl bg-white p-0 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-blue-600">
              <span className="material-symbols-outlined fill">wb_sunny</span>
              <span className="text-sm font-medium tracking-wide uppercase">Wednesday, Oct 25, 2023</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">07:55 AM</h2>
            <p className="text-lg text-slate-500 dark:text-gray-400">Good morning, Nguyen Van A! Ready to start?</p>
          </div>
          
          <div className="mt-6 flex items-center gap-4 md:mt-0">
             {/* Nút Check-in: Sau này ta sẽ gắn sự kiện onClick vào đây */}
             <button className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-emerald-500 px-8 py-4 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-95">
                <span className="material-symbols-outlined text-2xl group-hover:animate-pulse">fingerprint</span>
                <span className="text-lg font-bold tracking-wide">CHECK-IN</span>
             </button>
          </div>
        </div>
        {/* Decorative line */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-emerald-500/50"></div>
      </div>

      {/* --- SECTION 2: STATS GRID --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Card 1: Workdays */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Workdays</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Oct 2023</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">18<span className="text-xl font-medium text-slate-500">/22</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">On Track</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: '81%' }}></div>
          </div>
        </div>

        {/* Card 2: Late Duration */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20">
                <span className="material-symbols-outlined">timer_off</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Late Duration</h3>
            </div>
            <span className="text-xs font-medium text-slate-500">Total</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">0 <span className="text-lg font-normal text-slate-500">mins</span></span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Perfect</span>
          </div>
          <p className="mt-4 text-sm text-slate-500">Great job! You're consistently on time.</p>
        </div>

        {/* Card 3: Leave Balance */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                <span className="material-symbols-outlined">beach_access</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">Annual Leave</h3>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Request Leave</button>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">4.5 <span className="text-lg font-normal text-slate-500">Days</span></span>
            <span className="text-sm text-slate-500">Remaining</span>
          </div>
           {/* Visual bar */}
           <div className="mt-4 flex gap-1">
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-500"></div>
             <div className="h-1.5 flex-1 rounded-full bg-purple-200 dark:bg-purple-900/30">
               <div className="h-full w-1/2 bg-purple-500 rounded-l-full"></div>
             </div>
           </div>
        </div>
      </div>

      {/* --- SECTION 3: NOTIFICATIONS & HOLIDAYS --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Notifications */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Latest Notifications</h3>
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Leave Request Approved</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs text-slate-500">2 hours ago</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">Your leave request for <span className="font-medium text-slate-900 dark:text-gray-200">Oct 20, 2023</span> was approved.</p>
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <span className="material-symbols-outlined text-[20px]">campaign</span>
              </div>
               <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">New Policy Update</span>
                  <span className="text-xs text-slate-500">Yesterday</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">The updated WFH policy document is now available.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Holidays */}
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
           <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Holidays</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Holiday 1 */}
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-blue-600">flag</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sep 02</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">National Day</p>
            </div>
            {/* Holiday 2 */}
            <div className="min-w-[160px] flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                <span className="material-symbols-outlined text-indigo-500">celebration</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jan 01</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">New Year</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}