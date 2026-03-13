"use client";
import React, { useState } from 'react';
import { exportPayslipToPDF } from '@/utils/payrollExport';

const MyPayrollTable = ({ data, loading, employeeName }) => {
  // Lấy dữ liệu bảng lương (nếu là mảng thì lấy phần tử đầu tiên)
  const payroll = data ? (Array.isArray(data) ? data[0] : data) : null;
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!payroll) return;
    setPdfLoading(true);
    try {
      await exportPayslipToPDF(payroll, employeeName);
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
      alert('Xuất PDF thất bại!');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500 italic">Đang tải dữ liệu lương...</span>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <span className="text-gray-500 font-medium">Không có dữ liệu phiếu lương cho kỳ này.</span>
      </div>
    );
  }

  // Tính toán Tổng Thu Nhập và Tổng Khấu Trừ để hiển thị ở các Section
  const earnings = (payroll.baseSalary || 0) + (payroll.totalAllowance || 0) + (payroll.adjustmentAmount > 0 ? payroll.adjustmentAmount : 0);
  const deductions = (payroll.totalDeduction || 0) + (payroll.adjustmentAmount < 0 ? Math.abs(payroll.adjustmentAmount) : 0);
  const statusStr = payroll.status ? payroll.status.toUpperCase() : '';

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans">
      
      {/* CỘT TRÁI: TÓM TẮT & LỊCH SỬ (Sidebar) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Thẻ Summary (Tóm tắt Thực nhận) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">
            Tháng {payroll.month} / {payroll.year}
          </h3>
          <p className="text-sm text-gray-500 mb-1">Thực nhận (Net Salary)</p>
          <h2 className="text-3xl font-black text-gray-900 font-mono">
            {(payroll.finalNetSalary || 0).toLocaleString()} ₫
          </h2>
          
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || !payroll}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md shadow-blue-200"
          >
            {pdfLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Đang tạo PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Tải PDF Phiếu Lương
              </>
            )}
          </button>
        </div>

        {/* Lịch sử phiếu lương (Timeline) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hidden md:block">
          <h3 className="text-gray-800 font-bold mb-5">Lịch sử phê duyệt</h3>
          <div className="relative border-l-2 border-blue-500 ml-3 space-y-6">
            
            {/* Tháng hiện tại */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm"></div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusStr === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {statusStr === 'PAID' ? 'Đã chi trả' : 'Đã duyệt'}
              </span>
              <p className="font-bold text-gray-800 mt-2">Tháng {payroll.month} / {payroll.year}</p>
              <p className="text-xs text-blue-600 font-medium cursor-pointer">Đang xem chi tiết</p>
            </div>

            {/* Tháng trước (Hiển thị mờ để trang trí giống thiết kế) */}
            <div className="relative pl-6 opacity-40">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Đã chi trả</span>
              <p className="font-bold text-gray-800 mt-2">Tháng {payroll.month === 1 ? 12 : payroll.month - 1} / {payroll.month === 1 ? payroll.year - 1 : payroll.year}</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT DẠNG TREE (Breakdown) */}
      <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header của Breakdown */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
            Chi tiết (Breakdown)
          </h2>
          <div className="text-xs font-medium text-gray-500">
            Công thực tế: <span className="font-bold text-gray-800">{payroll.actualWorkDays} / {payroll.standardWorkDays}</span> ngày
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Nhóm THU NHẬP */}
          <div>
            <h3 className="flex items-center text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Thu nhập (Earnings)
            </h3>
            
            <div className="pl-4 space-y-4 border-l border-gray-200">
              <div className="flex justify-between items-center relative">
                <div className="absolute -left-[16.5px] top-1/2 w-3 border-t border-gray-200"></div>
                <span className="text-sm text-gray-600 font-medium">Lương cơ bản (Base Salary)</span>
                <span className="text-sm font-mono text-gray-800">{(payroll.baseSalary || 0).toLocaleString()} ₫</span>
              </div>
              
              <div className="flex justify-between items-center relative">
                <div className="absolute -left-[16.5px] top-1/2 w-3 border-t border-gray-200"></div>
                <span className="text-sm text-gray-600 font-medium">Phụ cấp (Allowances)</span>
                <span className="text-sm font-mono text-gray-800">{(payroll.totalAllowance || 0).toLocaleString()} ₫</span>
              </div>

              {/* Chỉ hiện thưởng nếu có thưởng */}
              {payroll.adjustmentAmount > 0 && (
                <div className="flex justify-between items-center relative">
                  <div className="absolute -left-[16.5px] top-1/2 w-3 border-t border-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-green-600 font-bold">Thưởng / Bonus</span>
                    <span className="text-xs italic text-gray-400 max-w-[200px] break-words">Lý do: {payroll.adjustmentReason}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-green-600">
                    +{(payroll.adjustmentAmount).toLocaleString()} ₫
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase">Tổng Thu Nhập:</span>
              <span className="font-mono font-bold text-gray-800">{earnings.toLocaleString()} ₫</span>
            </div>
          </div>

          {/* 2. Nhóm KHẤU TRỪ */}
          <div>
            <h3 className="flex items-center text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Khấu trừ (Deductions)
            </h3>
            
            <div className="pl-4 space-y-4 border-l border-gray-200">
              <div className="flex justify-between items-center relative">
                <div className="absolute -left-[16.5px] top-1/2 w-3 border-t border-gray-200"></div>
                <span className="text-sm text-gray-600 font-medium">Khấu trừ cố định (Thuế/BHXH)</span>
                <span className="text-sm font-mono text-gray-800">{(payroll.totalDeduction || 0).toLocaleString()} ₫</span>
              </div>

              {/* Chỉ hiện phạt nếu bị phạt (AdjustmentAmount < 0) */}
              {payroll.adjustmentAmount < 0 && (
                <div className="flex justify-between items-center relative">
                  <div className="absolute -left-[16.5px] top-1/2 w-3 border-t border-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-red-500 font-bold">Phạt / Penalty</span>
                    <span className="text-xs italic text-red-400 max-w-[200px] break-words">Lý do: {payroll.adjustmentReason}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-red-500">
                    -{(Math.abs(payroll.adjustmentAmount)).toLocaleString()} ₫
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-red-100 bg-red-50/50 -mx-6 px-6 pb-3 flex justify-end items-center gap-4">
              <span className="text-xs font-bold text-red-400 uppercase">Tổng Khấu Trừ:</span>
              <span className="font-mono font-bold text-red-600">{deductions.toLocaleString()} ₫</span>
            </div>
          </div>

          {/* 3. Tổng kết Thực nhận */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center text-white shadow-lg shadow-blue-200 mt-2">
            <div>
              <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest">NET SALARY</h3>
            </div>
            <div className="text-3xl font-black font-mono mt-2 sm:mt-0 drop-shadow-md">
              {(payroll.finalNetSalary || 0).toLocaleString()} VNĐ
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default MyPayrollTable;