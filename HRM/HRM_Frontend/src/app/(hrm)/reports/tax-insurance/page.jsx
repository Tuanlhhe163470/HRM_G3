'use client';
import React, { useState, useEffect } from 'react';
import { Table, Select, Segmented, message } from 'antd';
import * as XLSX from 'xlsx';
import { reportService } from '@/services/Report/reportService'; // Đảm bảo đường dẫn đúng

export default function TaxInsuranceReportPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [reportType, setReportType] = useState('Insurance'); // 'Insurance' hoặc 'Tax'
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(2026);

    // ─── TẢI DỮ LIỆU BÁO CÁO ──────────────────────────────────────────────────
    const fetchReport = async () => {
        setLoading(true);
        try {
            let res;
            // Gọi API tương ứng dựa trên loại báo cáo đang chọn
            if (reportType === 'Insurance') {
                res = await reportService.getInsuranceReport(month, year);
            } else {
                res = await reportService.getTaxReport(month, year);
            }
            // Validate and extract array to prevent Ant Design Table 'rawData.some is not a function' error
            let payload = res.data;
            if (payload && typeof payload === 'object' && !Array.isArray(payload) && Array.isArray(payload.data)) {
                payload = payload.data; // Mở bọc nếu Backend trả về dạng { data: [...] }
            }
            setData(Array.isArray(payload) ? payload : []);
        } catch (err) {
            message.error("Lỗi tải báo cáo. Có thể chưa có bảng lương nào được duyệt trong kỳ này.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [month, year, reportType]);

    // ─── XUẤT FILE EXCEL ──────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!data || data.length === 0) {
            message.warning("Không có dữ liệu để xuất Excel!");
            return;
        }

        // Tạo WorkSheet từ JSON data
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Đặt tên các cột cho đẹp
        if (reportType === 'Insurance') {
            XLSX.utils.sheet_add_aoa(ws, [
                ["Mã NV", "Họ Tên", "Phòng Ban", "Lương Cơ Bản", "NLĐ BHXH (8%)", "NLĐ BHYT (1.5%)", "NLĐ BHTN (1%)", "Tổng NLĐ Trích", "Cty BHXH (17.5%)", "Cty BHYT (3%)", "Cty BHTN (1%)", "Tổng Cty Trích"]
            ], { origin: "A1" });
        } else {
            XLSX.utils.sheet_add_aoa(ws, [
                ["Mã NV", "Họ Tên", "Phòng Ban", "Tổng Thu Nhập", "Giảm Trừ BH", "Giảm Trừ Bản Thân", "Thu Nhập Tính Thuế", "Thuế TNCN Phải Nộp"]
            ], { origin: "A1" });
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BaoCao");
        
        // Tải file xuống
        const fileName = `BaoCao_${reportType === 'Insurance' ? 'BHXH' : 'ThueTNCN'}_T${month}_${year}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // ─── CỘT CHO BẢNG BẢO HIỂM ────────────────────────────────────────────────
    const insuranceColumns = [
        { title: 'Nhân viên', key: 'emp', render: (_, r) => <div><b>{r.fullName}</b><br/><small className="text-gray-400">{r.employeeID}</small></div> },
        { title: 'Phòng ban', dataIndex: 'departmentName' },
        { title: 'Lương Đóng BH', dataIndex: 'baseSalary', render: v => <span className="font-mono font-bold text-gray-700">{(v||0).toLocaleString()}đ</span> },
        { 
            title: 'Trích từ NLĐ (10.5%)', 
            children: [
                { title: 'BHXH (8%)', dataIndex: 'empBHXH', render: v => (v||0).toLocaleString() },
                { title: 'BHYT (1.5%)', dataIndex: 'empBHYT', render: v => (v||0).toLocaleString() },
                { title: 'BHTN (1%)', dataIndex: 'empBHTN', render: v => (v||0).toLocaleString() },
                { title: 'Tổng NLĐ', dataIndex: 'totalEmpPay', render: v => <b className="text-red-500">{(v||0).toLocaleString()}đ</b> },
            ]
        },
        { 
            title: 'Doanh nghiệp đóng (21.5%)', 
            children: [
                { title: 'BHXH (17.5%)', dataIndex: 'compBHXH', render: v => (v||0).toLocaleString() },
                { title: 'BHYT (3%)', dataIndex: 'compBHYT', render: v => (v||0).toLocaleString() },
                { title: 'BHTN (1%)', dataIndex: 'compBHTN', render: v => (v||0).toLocaleString() },
                { title: 'Tổng Cty', dataIndex: 'totalCompPay', render: v => <b className="text-blue-600">{(v||0).toLocaleString()}đ</b> },
            ]
        }
    ];

    // ─── CỘT CHO BẢNG THUẾ TNCN ────────────────────────────────────────────────
    const taxColumns = [
        { title: 'Nhân viên', key: 'emp', render: (_, r) => <div><b>{r.fullName}</b><br/><small className="text-gray-400">{r.employeeID}</small></div> },
        { title: 'Phòng ban', dataIndex: 'departmentName' },
        { title: 'Tổng thu nhập', dataIndex: 'totalIncome', render: v => <span className="font-mono font-bold">{(v||0).toLocaleString()}đ</span> },
        { title: 'Trừ Bảo Hiểm', dataIndex: 'insuranceDeduction', render: v => <span className="text-red-500">-{(v||0).toLocaleString()}đ</span> },
        { title: 'Giảm trừ gia cảnh', dataIndex: 'personalDeduction', render: v => <span className="text-red-500">-{(v||0).toLocaleString()}đ</span> },
        { title: 'Thu nhập tính thuế', dataIndex: 'taxableIncome', render: v => <b className="text-orange-500">{(v||0).toLocaleString()}đ</b> },
        { title: 'Thuế TNCN', dataIndex: 'pitAmount', render: v => <b className="text-red-600 bg-red-50 px-2 py-1 rounded">{(v||0).toLocaleString()}đ</b> },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {/* HEADER & CONTROLS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Báo cáo Thuế & Bảo hiểm</h1>
                        <p className="text-sm text-gray-500 mt-1">Trích xuất số liệu tuân thủ (Chỉ lấy dữ liệu từ bảng lương đã CHỐT)</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Segmented 
                            options={[{ label: '🛡️ Bảo hiểm XH', value: 'Insurance' }, { label: '💰 Thuế TNCN', value: 'Tax' }]} 
                            value={reportType} 
                            onChange={setReportType} 
                        />
                        <div className="flex items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <Select value={month} onChange={setMonth} style={{ width: 100 }} bordered={false}
                                options={[...Array(12)].map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))} />
                            <div className="w-px h-5 bg-gray-300 mx-1"></div>
                            <Select value={year} onChange={setYear} style={{ width: 90 }} bordered={false}
                                options={[2025, 2026, 2027].map(y => ({ value: y, label: `Năm ${y}` }))} />
                        </div>
                        <button 
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {/* DATA TABLE */}
                <Table 
                    columns={reportType === 'Insurance' ? insuranceColumns : taxColumns} 
                    dataSource={data} 
                    rowKey="employeeID"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 'max-content' }}
                    summary={() => (
                        <div className="text-right text-gray-500 text-xs mt-2 italic">
                            * Số liệu tính toán dựa trên mức đóng quy định: NLĐ 10.5% - Doanh nghiệp 21.5%
                        </div>
                    )}
                />
            </div>
        </div>
    );
}