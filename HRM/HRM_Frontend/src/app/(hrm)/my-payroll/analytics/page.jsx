'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { payrollService } from '@/services/Payroll/payrollService';

export default function MyPayrollAnalyticsPage() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employeeName, setEmployeeName] = useState('');

    // Lấy tên nhân viên
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                setEmployeeName(u.fullName || u.name || 'Nhân viên');
            }
        } catch (e) {}
    }, []);

    // ─── TỰ ĐỘNG TẢI LỊCH SỬ LƯƠNG 6 THÁNG GẦN NHẤT ───────────────────────────
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            
            // Tạo mảng 6 tháng gần nhất (Bao gồm cả lùi năm nếu đang là đầu năm)
            const monthsToFetch = [];
            for (let i = 5; i >= 0; i--) {
                let m = currentMonth - i;
                let y = currentYear;
                if (m <= 0) {
                    m += 12;
                    y -= 1;
                }
                monthsToFetch.push({ month: m, year: y });
            }

            // Gọi API song song cho 6 tháng để tối ưu tốc độ
            const promises = monthsToFetch.map(async ({ month, year }) => {
                try {
                    // Sử dụng đúng API lấy lương cá nhân của bạn
                    const res = await payrollService.getMySalary(month, year);
                    return { month, year, data: res.data || null };
                } catch (error) {
                    return { month, year, data: null }; // Nếu tháng đó chưa có lương thì bỏ qua
                }
            });

            const results = await Promise.all(promises);
            
            // Lọc và format lại data
            const formattedData = results.map(item => ({
                label: `T${item.month}/${item.year.toString().slice(-2)}`,
                netSalary: item.data?.finalNetSalary || 0,
                baseSalary: item.data?.baseSalary || 0,
                allowance: item.data?.totalAllowance || 0,
                deduction: item.data?.totalDeduction || 0,
                adjustment: item.data?.adjustmentAmount || 0,
                hasData: !!item.data
            }));

            setHistoryData(formattedData);
        } catch (err) {
            console.error('Lỗi khi tải lịch sử:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    // ─── TÍNH TOÁN KPI (MỨC MAX ĐỂ VẼ BIỂU ĐỒ) ──────────────────────────────
    const { maxSalary, avgSalary, totalYTD } = useMemo(() => {
        const validMonths = historyData.filter(d => d.hasData);
        if (!validMonths.length) return { maxSalary: 10000000, avgSalary: 0, totalYTD: 0 };

        const max = Math.max(...validMonths.map(d => d.netSalary));
        const total = validMonths.reduce((sum, d) => sum + d.netSalary, 0);
        return {
            maxSalary: max < 10000000 ? 10000000 : max + (max * 0.1), // Cộng thêm 10% đỉnh để biểu đồ không bị kịch trần
            avgSalary: total / validMonths.length,
            totalYTD: total
        };
    }, [historyData]);

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Thống kê Thu nhập cá nhân</h1>
                    <p className="text-sm text-gray-500 mt-1">Xin chào <span className="font-bold text-blue-600">{employeeName}</span>, đây là biểu đồ dòng tiền của bạn trong 6 tháng qua.</p>
                </div>
                <button 
                    onClick={fetchHistory}
                    disabled={loading}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-blue-600 font-bold">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div> Đang phân tích dữ liệu...
                </div>
            ) : (
                <div className="space-y-6">
                    {/* KHỐI 1: TỔNG QUAN (KPI) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Tổng thu nhập (6 tháng)</p>
                            <h2 className="text-3xl font-black font-mono">{totalYTD.toLocaleString()}đ</h2>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Trung bình mỗi tháng</p>
                            <h2 className="text-2xl font-bold text-gray-800 font-mono">{avgSalary.toLocaleString()}đ</h2>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tháng cao nhất</p>
                            <h2 className="text-2xl font-bold text-green-600 font-mono">
                                {Math.max(0, ...historyData.map(d => d.netSalary)).toLocaleString()}đ
                            </h2>
                        </div>
                    </div>

                    {/* KHỐI 2: BIỂU ĐỒ CỘT (BAR CHART) VẼ BẰNG TAILWIND */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-8">Biểu đồ Thực nhận (Net Salary)</h3>
                        
                        <div className="relative h-72 flex items-end justify-between gap-2 md:gap-6 pt-6 border-b border-gray-200">
                            
                            {/* Các đường gióng ngang (Grid lines) */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0 text-gray-300">
                                {[1, 0.75, 0.5, 0.25, 0].map((step, idx) => (
                                    <div key={idx} className="flex items-center w-full border-t border-dashed border-gray-200 h-0 relative">
                                        <span className="absolute -top-3 -left-12 text-[10px] font-mono text-gray-400 font-medium">
                                            {((maxSalary * step) / 1000000).toFixed(0)}M
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Cột dữ liệu (Bars) */}
                            {historyData.map((item, idx) => {
                                const heightPct = (item.netSalary / maxSalary) * 100;
                                
                                return (
                                    <div key={idx} className="relative group w-full flex flex-col items-center justify-end h-full z-10">
                                        
                                        {/* Tooltip hiển thị khi Hover */}
                                        {item.hasData && (
                                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg pointer-events-none z-20 shadow-xl whitespace-nowrap">
                                                <p className="font-mono text-sm text-green-400 mb-1">{item.netSalary.toLocaleString()}đ</p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-300 font-normal">
                                                    <span>Lương cơ bản:</span> <span className="text-right text-white">{(item.baseSalary).toLocaleString()}đ</span>
                                                    <span>Phụ cấp:</span> <span className="text-right text-white">{(item.allowance).toLocaleString()}đ</span>
                                                    <span>Khấu trừ:</span> <span className="text-right text-red-400">-{(item.deduction).toLocaleString()}đ</span>
                                                    {item.adjustment !== 0 && (
                                                        <>
                                                            <span>Thưởng/Phạt:</span> 
                                                            <span className={`text-right ${item.adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {item.adjustment > 0 ? '+' : ''}{(item.adjustment).toLocaleString()}đ
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Thanh cột */}
                                        <div 
                                            className={`w-full max-w-[60px] rounded-t-lg transition-all duration-700 ease-out cursor-pointer hover:brightness-110 ${item.hasData ? 'bg-blue-500 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-100'}`}
                                            style={{ height: item.hasData ? `${heightPct}%` : '5%' }}
                                        >
                                            {!item.hasData && (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold rotate-90">N/A</div>
                                            )}
                                        </div>

                                        {/* Nhãn trục X (Tháng) */}
                                        <span className="absolute -bottom-8 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Thông điệp động viên */}
                    <div className="text-center mt-10">
                        <p className="text-sm text-gray-400 italic">"Cố gắng nỗ lực mỗi ngày để cột biểu đồ tiếp theo cao hơn cột trước nhé!" 🚀</p>
                    </div>
                </div>
            )}
        </div>
    );
}