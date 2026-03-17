'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrollService } from '@/services/Payroll/payrollService';
import { Select } from 'antd'; // Import thêm Select từ antd

// ─── Các role được phép vào trang này ──────────────────────────────────────
const ALLOWED_ROLES = ['HR', 'Manager', 'Admin'];

// ─── Hiển thị badge trạng thái ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        Draft:    { label: 'Nháp',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
        Approved: { label: 'Đã duyệt',  cls: 'bg-green-100 text-green-700 border-green-200' },
        Rejected: { label: 'Từ chối',   cls: 'bg-red-100 text-red-700 border-red-200' },
        Paid:     { label: 'Đã trả',    cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    };
    const s = map[status] || { label: status || 'DRAFT', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.cls}`}>
            {s.label}
        </span>
    );
};

export default function PayrollAdjustmentPage() {
    const router = useRouter();

    // ── State chính ──────────────────────────────────────────────────────────
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // ── State form điều chỉnh ────────────────────────────────────────────────
    const [bonusAmount, setBonusAmount] = useState('');
    const [penaltyAmount, setPenaltyAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ── Đã sửa: State cho Tháng/Năm có thể thay đổi được ───────────────────
    const [month, setMonth] = useState(2);
    const [year, setYear] = useState(2026);

    // ── Lấy role từ localStorage ─────────────────────────────────────────────
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                setUserRole(u.roleName || u.role || '');
            }
        } catch (e) {}
    }, []);

    // ── Tải bảng lương ───────────────────────────────────────────────────────
    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const res = await payrollService.getMonthlyPayroll(month, year);
            setPayrolls(res.data || []);
            // Xóa record đang chọn nếu người dùng đổi tháng để tránh hiển thị sai dữ liệu
            setSelectedRecord(null); 
            setBonusAmount('');
            setPenaltyAmount('');
            setAdjustReason('');
            setSaveSuccess(false);
        } catch (err) {
            console.error('Lỗi tải bảng lương:', err);
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại API mỗi khi month hoặc year thay đổi
    useEffect(() => { 
        fetchPayrolls(); 
    }, [month, year]);

    // ── Chọn nhân viên từ sidebar ─────────────────────────────────────────────
    const handleSelect = (record) => {
        setSelectedRecord(record);
        
        // Bóc tách tiền thưởng và phạt từ số tiền điều chỉnh hiện tại
        const existingAmt = record.adjustmentAmount || 0;
        if (existingAmt > 0) {
            setBonusAmount(existingAmt);
            setPenaltyAmount('');
        } else if (existingAmt < 0) {
            setBonusAmount('');
            setPenaltyAmount(Math.abs(existingAmt)); // Lấy số tuyệt đối hiển thị ở ô phạt
        } else {
            setBonusAmount('');
            setPenaltyAmount('');
        }

        setAdjustReason(record.adjustmentReason || '');
        setSaveSuccess(false);
    };

    // ── Lưu điều chỉnh ──────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedRecord) return;
        if (!adjustReason.trim()) {
            alert('Vui lòng nhập lý do điều chỉnh!');
            return;
        }
        setSaving(true);
        try {
            // Tự động tính toán: Tổng = Thưởng - Phạt
            const finalAdjustAmount = (Number(bonusAmount) || 0) - (Number(penaltyAmount) || 0);

            await payrollService.adjustPayroll(
                selectedRecord.payrollID,
                finalAdjustAmount,
                adjustReason
            );
            setSaveSuccess(true);
            await fetchPayrolls();
            // Cập nhật lại record đang chọn
            const updated = payrolls.find(p => p.payrollID === selectedRecord.payrollID);
            if (updated) setSelectedRecord({ ...updated, adjustmentAmount: finalAdjustAmount, adjustmentReason: adjustReason });
        } catch (err) {
            alert('Lỗi khi lưu điều chỉnh: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    // ── Lọc danh sách sidebar ────────────────────────────────────────────────
    const filteredPayrolls = payrolls.filter(p =>
        (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.employeeID?.toString() || '').includes(searchTerm)
    );

    // ── Tính toán preview điều chỉnh ─────────────────────────────────────────
    const amt = (Number(bonusAmount) || 0) - (Number(penaltyAmount) || 0);
    const isBonus = amt > 0;
    const isPenalty = amt < 0;

    // ── Kiểm tra quyền ──────────────────────────────────────────────────────
    if (userRole !== null && !ALLOWED_ROLES.includes(userRole)) {
        return (
            <div className="p-8 max-w-lg mx-auto mt-20 text-center">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="text-xl font-black text-red-700 mb-2">Không có quyền truy cập</h2>
                <p className="text-sm text-gray-500">Trang này chỉ dành cho HR / Manager / Admin.</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">

            {/* ── Top Bar ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/payroll/payroll-processing')}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        title="Quay lại"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-800 tracking-tight">Điều Chỉnh Lương Thủ Công</h1>
                        <p className="text-xs text-gray-400">Tháng {month < 10 ? `0${month}` : month}/{year}</p>
                    </div>
                </div>
                <button
                    onClick={fetchPayrolls}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm mới
                </button>
            </div>

            {/* ── Main Layout ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ═══════════════════════════════════════════════════════
                    SIDEBAR — Danh sách nhân viên
                ═══════════════════════════════════════════════════════ */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

                    {/* Vùng Tìm kiếm và Chọn Tháng/Năm */}
                    <div className="p-4 border-b border-gray-100">
                        {/* Dropdown Chọn Tháng Năm */}
                        <div className="flex items-center gap-2 mb-3">
                            <Select
                                value={month}
                                onChange={setMonth}
                                style={{ width: '50%' }}
                                options={[...Array(12)].map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
                            />
                            <Select
                                value={year}
                                onChange={setYear}
                                style={{ width: '50%' }}
                                options={[2025, 2026, 2027].map(y => ({ value: y, label: `Năm ${y}` }))}
                            />
                        </div>

                        {/* Ô Input Tìm Kiếm */}
                        <div className="relative">
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{filteredPayrolls.length} nhân viên trong kỳ</p>
                    </div>

                    {/* Danh sách nhân viên */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-32 text-gray-400 text-sm italic">Đang tải...</div>
                        ) : filteredPayrolls.length === 0 ? (
                            <div className="flex justify-center items-center h-32 text-gray-400 text-sm">Không tìm thấy</div>
                        ) : (
                            filteredPayrolls.map(p => (
                                <button
                                    key={p.payrollID}
                                    onClick={() => handleSelect(p)}
                                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-blue-50 transition-colors flex items-start gap-3 ${
                                        selectedRecord?.payrollID === p.payrollID
                                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                            : 'border-l-4 border-l-transparent'
                                    }`}
                                >
                                    {/* Avatar chữ cái */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {(p.fullName || 'N').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-gray-800 truncate">{p.fullName || 'N/A'}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">ID: {p.employeeID}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs font-mono text-green-600 font-bold">
                                                {(p.finalNetSalary || 0).toLocaleString()}đ
                                            </span>
                                            <StatusBadge status={p.status} />
                                        </div>
                                        {/* Indicator nếu đã có điều chỉnh */}
                                        {p.adjustmentAmount !== 0 && p.adjustmentAmount != null && (
                                            <div className={`text-[10px] font-bold mt-1 ${p.adjustmentAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {p.adjustmentAmount > 0 ? '▲ Thưởng' : '▼ Phạt'}: {Math.abs(p.adjustmentAmount).toLocaleString()}đ
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    NỘI DUNG CHÍNH — Form điều chỉnh
                ═══════════════════════════════════════════════════════ */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedRecord ? (
                        /* Empty state khi chưa chọn nhân viên */
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-600 mb-1">Chọn nhân viên để điều chỉnh</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Chọn một nhân viên từ danh sách bên trái để xem chi tiết lương và thực hiện điều chỉnh thưởng/phạt.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto">

                            {/* ── Thông tin nhân viên ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                                        {(selectedRecord.fullName || 'N').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-800">{selectedRecord.fullName}</h2>
                                        <p className="text-sm text-gray-400">Mã NV: {selectedRecord.employeeID} • Tháng {month}/{year}</p>
                                        <div className="mt-1"><StatusBadge status={selectedRecord.status} /></div>
                                    </div>
                                </div>

                                {/* ── Tóm tắt lương hiện tại ── */}
                                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Lương cơ bản</p>
                                        <p className="text-base font-bold font-mono text-gray-800">{(selectedRecord.baseSalary || 0).toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Khấu trừ</p>
                                        <p className="text-base font-bold font-mono text-red-600">-{(selectedRecord.totalDeduction || 0).toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-center bg-green-50 rounded-xl py-2">
                                        <p className="text-xs text-green-600 uppercase tracking-wider mb-1 font-bold">Thực nhận NET</p>
                                        <p className="text-base font-black font-mono text-green-700">{(selectedRecord.finalNetSalary || 0).toLocaleString()}đ</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Form điều chỉnh ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-gray-800 mb-5 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-black">✎</span>
                                    Điều chỉnh thưởng / phạt
                                </h3>

                                {/* Giao diện 2 Input: Thưởng và Phạt riêng biệt */}
                                <div className="mb-2 grid grid-cols-2 gap-4">
                                    {/* Cột Thưởng */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Tiền Thưởng (đ)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={bonusAmount}
                                                onChange={(e) => { setBonusAmount(e.target.value); setSaveSuccess(false); }}
                                                placeholder="VD: 500000"
                                                className="w-full px-4 py-3 text-lg font-mono border-2 rounded-xl outline-none transition-colors border-gray-200 focus:border-green-400 bg-white"
                                            />
                                            <span className="absolute right-3 top-3 text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">
                                                🎁 Thưởng (+)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cột Phạt */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Tiền Phạt (đ)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={penaltyAmount}
                                                onChange={(e) => { setPenaltyAmount(e.target.value); setSaveSuccess(false); }}
                                                placeholder="VD: 200000"
                                                className="w-full px-4 py-3 text-lg font-mono border-2 rounded-xl outline-none transition-colors border-gray-200 focus:border-red-400 bg-white"
                                            />
                                            <span className="absolute right-3 top-3 text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded-lg">
                                                ⚠️ Phạt (−)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hiển thị tổng tiền tính toán từ 2 ô */}
                                {amt !== 0 && (
                                    <p className={`text-sm mt-2 mb-5 font-medium ${isBonus ? 'text-green-600' : 'text-red-600'}`}>
                                        Tổng điều chỉnh: {isBonus ? '+ ' : ''}{amt.toLocaleString()}đ
                                    </p>
                                )}

                                {/* Input lý do */}
                                <div className="mb-6 mt-3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Lý do điều chỉnh <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={adjustReason}
                                        onChange={(e) => { setAdjustReason(e.target.value); setSaveSuccess(false); }}
                                        placeholder="Mô tả cụ thể lý do thưởng hoặc phạt (VD: Đi trễ 3 ngày, Hoàn thành dự án đúng hạn...)"
                                        rows={4}
                                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none resize-none"
                                    />
                                </div>

                                {/* Preview kết quả */}
                                {amt !== 0 && (
                                    <div className={`rounded-xl p-4 mb-5 ${isBonus ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Dự kiến sau điều chỉnh</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">
                                                Net cũ: <span className="font-mono font-bold">{(selectedRecord.finalNetSalary || 0).toLocaleString()}đ</span>
                                            </span>
                                            <span className={`text-sm font-bold ${isBonus ? 'text-green-700' : 'text-red-600'}`}>
                                                {isBonus ? '+' : ''}{amt.toLocaleString()}đ
                                            </span>
                                            <span className="text-base font-black font-mono text-gray-800">
                                                ≈ {((selectedRecord.finalNetSalary || 0) + amt).toLocaleString()}đ
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Success message */}
                                {saveSuccess && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Đã lưu điều chỉnh thành công!
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setSelectedRecord(null); setBonusAmount(''); setPenaltyAmount(''); setAdjustReason(''); setSaveSuccess(false); }}
                                        className="flex-1 py-3 text-sm font-bold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Huỷ / Chọn lại
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !adjustReason.trim()}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                                Đang lưu...
                                            </>
                                        ) : '💾 Lưu điều chỉnh'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}