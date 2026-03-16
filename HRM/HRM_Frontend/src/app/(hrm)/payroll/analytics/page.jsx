'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { payrollService } from '@/services/Payroll/payrollService';

const ALLOWED_ROLES = ['Manager', 'Admin'];

export default function PayrollAnalyticsPage() {
    const router = useRouter();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(2026); // Hardcode theo DB test của bạn
    const [userRole, setUserRole] = useState(null);

    // Kiểm tra quyền
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                setUserRole(u.roleName || u.role || '');
            }
        } catch (e) {}
    }, []);

    // Lấy dữ liệu
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await payrollService.getMonthlyPayroll(month, year);
            setPayrolls(res.data || []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu phân tích:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [month, year]);

    // ─── TÍNH TOÁN DỮ LIỆU LOGIC (REAL-TIME) ──────────────────────────────
    const analytics = useMemo(() => {
        if (!payrolls.length) return null;

        // 1. Tổng quỹ lương
        const totalNet = payrolls.reduce((sum, p) => sum + (p.finalNetSalary || 0), 0);
        const totalBase = payrolls.reduce((sum, p) => sum + (p.baseSalary || 0), 0);
        const totalAllowance = payrolls.reduce((sum, p) => sum + (p.totalAllowance || 0), 0);
        
        // Bóc tách Thưởng (Adjustment > 0) và Phạt (Adjustment < 0)
        const totalBonus = payrolls.reduce((sum, p) => sum + (p.adjustmentAmount > 0 ? p.adjustmentAmount : 0), 0);
        const totalPenalty = payrolls.reduce((sum, p) => sum + (p.adjustmentAmount < 0 ? Math.abs(p.adjustmentAmount) : 0), 0);
        const totalDeduction = payrolls.reduce((sum, p) => sum + (p.totalDeduction || 0), 0) + totalPenalty;

        // 2. Tỷ trọng chi phí (Tỷ lệ % so với Tổng Gross)
        const totalGross = totalBase + totalAllowance + totalBonus;
        const costBasePct = totalGross ? ((totalBase / totalGross) * 100).toFixed(1) : 0;
        const costAllowPct = totalGross ? ((totalAllowance / totalGross) * 100).toFixed(1) : 0;
        const costBonusPct = totalGross ? ((totalBonus / totalGross) * 100).toFixed(1) : 0;

        // 3. Top / Bottom Nhân viên
        const sortedDesc = [...payrolls].sort((a, b) => (b.finalNetSalary || 0) - (a.finalNetSalary || 0));
        const topEarners = sortedDesc.slice(0, 3);
        const bottomEarners = sortedDesc.slice(-3).reverse();

        // 4. Phân tích theo phòng ban
        const deptMap = {};
        payrolls.forEach(p => {
            const dName = p.departmentName || 'Phòng ban khác';
            deptMap[dName] = (deptMap[dName] || 0) + (p.finalNetSalary || 0);
        });
        const deptCosts = Object.entries(deptMap)
            .map(([name, cost]) => ({ name, cost, pct: ((cost / totalNet) * 100).toFixed(1) }))
            .sort((a, b) => b.cost - a.cost);

        return { totalNet, totalBase, totalAllowance, totalBonus, totalDeduction, costBasePct, costAllowPct, costBonusPct, topEarners, bottomEarners, deptCosts };
    }, [payrolls]);

    // ─── GIAO DIỆN BẢO VỆ ────────────────────────────────────────────────
    if (userRole !== null && !ALLOWED_ROLES.includes(userRole)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="text-6xl mb-4">🛡️</div>
                <h2 className="text-2xl font-black text-gray-800">Truy cập bị từ chối</h2>
                <p className="text-gray-500 mt-2">Báo cáo phân tích tài chính chỉ dành riêng cho cấp Quản lý (Manager/Admin).</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Phân Tích Quỹ Lương</h1>
                    <p className="text-sm text-gray-500 mt-1">Dashboard hỗ trợ ra quyết định tài chính & tối ưu chi phí</p>
                </div>
                <div className="flex gap-3 items-center bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-xs font-bold text-gray-400 uppercase ml-2">Kỳ lương:</span>
                    <Select value={month} onChange={setMonth} style={{ width: 100 }} bordered={false}
                        options={[...Array(12)].map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))} />
                    <div className="w-px h-5 bg-gray-200"></div>
                    <Select value={year} onChange={setYear} style={{ width: 100 }} bordered={false}
                        options={[2025, 2026, 2027].map(y => ({ value: y, label: `Năm ${y}` }))} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-blue-600 font-bold">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div> Đang tổng hợp dữ liệu...
                </div>
            ) : !analytics ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500 font-medium">Chưa có dữ liệu tính lương cho tháng này.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* KHỐI 1: TỔNG QUAN CHI PHÍ (Kpi Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Tổng quỹ lương (Net)</p>
                            <h2 className="text-3xl font-black font-mono">{analytics.totalNet.toLocaleString()}đ</h2>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Lương cơ bản</p>
                            <h2 className="text-2xl font-bold text-gray-800 font-mono">{analytics.totalBase.toLocaleString()}đ</h2>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Phụ cấp & Thưởng</p>
                            <h2 className="text-2xl font-bold text-green-600 font-mono">{(analytics.totalAllowance + analytics.totalBonus).toLocaleString()}đ</h2>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Khấu trừ & Phạt</p>
                            <h2 className="text-2xl font-bold text-red-600 font-mono">{analytics.totalDeduction.toLocaleString()}đ</h2>
                        </div>
                    </div>

                    {/* KHỐI 2: TỶ TRỌNG VÀ BIỂU ĐỒ PHÒNG BAN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Biểu đồ chi phí theo phòng ban */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Chi phí theo Phòng ban</h3>
                            <div className="space-y-6">
                                {analytics.deptCosts.map((dept, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{dept.name}</span>
                                            <span className="font-mono font-bold text-gray-900">{dept.cost.toLocaleString()}đ <span className="text-gray-400 text-xs font-sans">({dept.pct}%)</span></span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className={`h-3 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : idx === 1 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : idx === 2 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`} 
                                                style={{ width: `${dept.pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cơ cấu dòng tiền */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Cơ cấu dòng tiền chi trả</h3>
                            
                            {/* Thanh Progress Bar ghép */}
                            <div className="w-full h-6 flex rounded-full overflow-hidden mb-8 shadow-inner">
                                <div className="bg-indigo-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${analytics.costBasePct}%` }}>
                                    {analytics.costBasePct > 10 ? `${analytics.costBasePct}%` : ''}
                                </div>
                                <div className="bg-emerald-400 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${analytics.costAllowPct}%` }}>
                                    {analytics.costAllowPct > 10 ? `${analytics.costAllowPct}%` : ''}
                                </div>
                                <div className="bg-amber-400 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${analytics.costBonusPct}%` }}>
                                    {analytics.costBonusPct > 10 ? `${analytics.costBonusPct}%` : ''}
                                </div>
                            </div>

                            {/* Chú thích */}
                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                        <span className="text-sm font-bold text-gray-700">Lương cứng (Base)</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold">{analytics.totalBase.toLocaleString()}đ</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                        <span className="text-sm font-bold text-gray-700">Phụ cấp cố định</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold">{analytics.totalAllowance.toLocaleString()}đ</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <span className="text-sm font-bold text-gray-700">Thưởng & Biến đổi</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold">{analytics.totalBonus.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 3: TOP NHÂN VIÊN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Cao Nhất */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <span>🏆</span> Top thu nhập cao nhất
                            </h3>
                            <div className="space-y-3">
                                {analytics.topEarners.map((emp, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/30 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shadow-sm">{idx + 1}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{emp.fullName}</p>
                                                <p className="text-xs text-gray-500">{emp.departmentName || 'Nhân viên'}</p>
                                            </div>
                                        </div>
                                        <span className="font-mono font-black text-emerald-600 text-base">{(emp.finalNetSalary || 0).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Thấp Nhất */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <span>⚠️</span> Cần chú ý (Thu nhập thấp nhất)
                            </h3>
                            <div className="space-y-3">
                                {analytics.bottomEarners.map((emp, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-rose-50/30 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm shadow-sm">{idx + 1}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{emp.fullName}</p>
                                                <p className="text-xs text-gray-500">Có thể do nghỉ nhiều / Phạt</p>
                                            </div>
                                        </div>
                                        <span className="font-mono font-black text-gray-700 text-base">{(emp.finalNetSalary || 0).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}