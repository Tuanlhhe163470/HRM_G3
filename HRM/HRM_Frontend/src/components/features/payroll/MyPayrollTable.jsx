"use client";
import React, { useRef, useState } from 'react';
import { exportPayslipToPDF } from '@/utils/payrollExport';

export default function MyPayrollTable({ data, loading, employeeName }) {
    const printRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ─── HÀM XỬ LÝ XUẤT PDF ──────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        if (!data) return;
        setIsDownloading(true);
        try {
            await exportPayslipToPDF(data, employeeName);
        } catch (error) {
            console.error("Lỗi khi xuất PDF:", error);
            alert("Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại!");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 font-bold">Đang tải phiếu lương...</span>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-bold text-gray-600">Chưa có phiếu lương</h3>
            <p className="text-sm text-gray-400">Không tìm thấy dữ liệu cho tháng này.</p>
        </div>
    );

    const standardDays = data.standardWorkDays || 20;
    const actualDays = data.actualWorkDays || 0;
    const paidLeaves = data.paidLeaveDays || 0;
    // backend ActualWorkDays đã bao gồm paidLeaves, nên số ngày đi làm THỰC SỰ là:
    const actualWorkedOnly = actualDays - paidLeaves;
    const unpaidLeaves = (standardDays - actualDays > 0) ? (standardDays - actualDays) : 0;
    const adjustment = data.adjustmentAmount || 0;
    const reason = data.adjustmentReason || '';

    const otHours = data.otHours || 0;
    const otPay = data.otPay || 0;
    const advanceDeduction = data.advanceDeduction || 0;

    // Tính toán lại Lương cơ bản theo ngày công thực tế và ngày công có lương
    const salaryPerDay = standardDays > 0 ? (data.baseSalary / standardDays) : 0;
    const actualWorkPay = salaryPerDay * actualWorkedOnly;
    const paidLeavePay = salaryPerDay * paidLeaves;

    // Tách riêng các phụ cấp/khấu trừ để không bị cộng gộp 2 lần
    const otherAllowances = (data.totalAllowance || 0) - otPay;
    const otherDeductions = (data.totalDeduction || 0) - advanceDeduction;

    const totalEarnings = actualWorkPay + paidLeavePay + (data.totalAllowance || 0);
    const totalDeductions = data.totalDeduction || 0;

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* CỘT TRÁI: TÓM TẮT & NÚT TẢI PDF */}
            <div className="w-full md:w-1/4 flex flex-col gap-4 sticky top-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tháng {data.month} / {data.year}</h3>
                    <p className="text-sm text-gray-400">Thực nhận (Net Salary)</p>
                    <h2 className="text-3xl font-black text-blue-600 mt-2 break-words">
                        {(data.finalNetSalary || 0).toLocaleString()} <span className="text-lg font-bold text-gray-400">VNĐ</span>
                    </h2>
                    
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="mt-6 w-full bg-gray-800 hover:bg-black text-white rounded-xl py-3.5 font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                        )}
                        {isDownloading ? 'Đang tạo PDF...' : 'Tải PDF Phiếu Lương'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-5">Lịch sử phê duyệt</h3>
                    <div className="relative pl-4 border-l-2 border-blue-500 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Đã duyệt</span>
                            <h4 className="text-sm font-bold text-gray-800 mt-1.5">Tháng {data.month} / {data.year}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: KHU VỰC IN PDF (BỌC PRINT REF) */}
            <div 
                ref={printRef} 
                className="w-full md:w-3/4 bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-gray-800"
            >
                {/* Header bản in */}
                <div className="flex justify-between items-end mb-8 pb-6 border-b-2 border-gray-800">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">PHIẾU LƯƠNG CHI TIẾT</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Kỳ lương: Tháng {data.month} / Năm {data.year}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-gray-800">{employeeName || "Nhân viên"}</h2>
                        <p className="text-sm text-gray-500">Mã NV: {data.employeeID || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-1">Công ty Công nghệ G3</p>
                    </div>
                </div>

                {/* Thông tin ngày công */}
                <div className="bg-gray-50 rounded-xl p-5 mb-8 flex justify-between items-center border border-gray-100">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Công chuẩn</p>
                        <p className="text-lg font-bold text-gray-800">{standardDays} ngày</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Thực tế</p>
                        <p className="text-lg font-black text-blue-600">{actualDays} ngày</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nghỉ có lương</p>
                        <p className="text-lg font-bold text-green-600">{paidLeaves} ngày</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Không lương</p>
                        <p className="text-lg font-bold text-red-500">{unpaidLeaves} ngày</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Phần Thu Nhập */}
                    <div>
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-800">I. THU NHẬP (EARNINGS)</h4>
                        </div>
                        <div className="space-y-3 px-2">
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                <span className="text-gray-600 flex flex-col">
                                    <span>Lương cơ bản (Theo Hợp đồng)</span>
                                    <span className="text-xs text-gray-400">({(data.baseSalary || 0).toLocaleString()} đ / {standardDays} ngày)</span>
                                </span>
                            </div>
                            
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                <span className="text-gray-600">Thù lao Ngày đi làm thực tế ({actualWorkedOnly} ngày)</span>
                                <span className="font-mono font-medium text-gray-900">{actualWorkPay.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                            </div>

                            {paidLeavePay > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600 text-green-700 font-medium">Thù lao Nghỉ phép có lương ({paidLeaves} ngày)</span>
                                    <span className="font-mono font-medium text-green-700">{paidLeavePay.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                                </div>
                            )}
                            
                            {/* Hiển thị số giờ và thu nhập OT */}
                            {otPay > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        Thù lao Làm thêm giờ (OT)
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{otHours} giờ</span>
                                    </span>
                                    <span className="font-mono font-medium text-gray-900">{otPay.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                                </div>
                            )}

                            {/* Render các khoản phụ cấp chi tiết */}
                            {data.allowances && data.allowances.length > 0 && data.allowances.map((allowance, index) => (
                                <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600">{allowance.componentName}</span>
                                    <span className="font-mono font-medium text-gray-900">{(allowance.amount || 0).toLocaleString()} đ</span>
                                </div>
                            ))}

                            {/* Render dự phòng nếu không có danh sách chi tiết nhưng vẫn có OtherAllowances */}
                            {(!data.allowances || data.allowances.length === 0) && otherAllowances > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600">Phụ cấp & Thưởng khác</span>
                                    <span className="font-mono font-medium text-gray-900">{(otherAllowances).toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-sm mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <span className="font-bold text-blue-900 uppercase">THU NHẬP TRƯỚC GIẢM TRỪ</span>
                            <span className="font-black font-mono text-blue-900">{totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                        </div>
                    </div>

                    {/* Phần Khấu Trừ */}
                    <div>
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path></svg>
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-800">II. KHẤU TRỪ (DEDUCTIONS)</h4>
                        </div>
                        <div className="space-y-3 px-2">
                            {/* Render các khoản khấu trừ chi tiết */}
                            {data.deductions && data.deductions.length > 0 && data.deductions.map((deduction, index) => (
                                <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600">{deduction.componentName}</span>
                                    <span className="font-mono font-medium text-gray-900">{(deduction.amount || 0).toLocaleString()} đ</span>
                                </div>
                            ))}

                            {/* Render dự phòng nếu không có danh sách chi tiết nhưng vẫn có OtherDeductions */}
                            {(!data.deductions || data.deductions.length === 0) && otherDeductions > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600">Khấu trừ Bảo hiểm / Thuế cá nhân</span>
                                    <span className="font-mono font-medium text-gray-900">{otherDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                                </div>
                            )}
                            
                            {/* Hiển thị khoản ứng lương đã trừ */}
                            {advanceDeduction > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-50 border-dashed">
                                    <span className="text-gray-600 font-medium whitespace-nowrap">Khấu trừ tiền Ứng khoán (Tạm ứng)</span>
                                    <span className="font-mono font-medium text-red-600 flex gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      {advanceDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-sm mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                            <span className="font-bold text-red-900 uppercase">TỔNG KHẤU TRỪ</span>
                            <span className="font-black font-mono text-red-800">{totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })} đ</span>
                        </div>
                    </div>

                    {/* Điều chỉnh Thưởng/Phạt */}
                    {adjustment !== 0 && (
                        <div>
                            <h4 className={`text-sm font-black uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 ${adjustment > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                III. ĐIỀU CHỈNH ({adjustment > 0 ? 'THƯỞNG' : 'PHẠT'})
                            </h4>
                            <div className={`p-4 rounded-xl border ${adjustment > 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex justify-between items-start text-sm">
                                    <div className="pr-6">
                                        <span className="font-bold text-gray-700 block mb-1">Ghi chú từ bộ phận Nhân sự:</span>
                                        <span className="italic text-gray-600">"{reason || 'Không có ghi chú chi tiết'}"</span>
                                    </div>
                                    <span className={`font-mono font-black text-lg whitespace-nowrap ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {adjustment > 0 ? '+' : ''}{adjustment.toLocaleString()} đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Box Tổng Kết Cuối Cùng */}
                <div className="mt-10 pt-6 border-t-2 border-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-black tracking-widest uppercase text-xl text-gray-900">THỰC NHẬN</span>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Đã bao gồm điều chỉnh</p>
                        </div>
                        <span className="text-4xl font-black font-mono text-blue-600">{(data.finalNetSalary || 0).toLocaleString()} <span className="text-2xl">VNĐ</span></span>
                    </div>
                </div>

                <div className="mt-16 text-center text-xs text-gray-400 italic">
                    Phiếu lương này được tạo tự động từ Hệ thống Quản trị Nhân sự HRM G3.<br/>
                    Mọi thắc mắc vui lòng liên hệ bộ phận HR hoặc Quản lý trực tiếp.
                </div>
            </div>
        </div>
    );
}