// src/utils/payrollExport.js
// Utility functions cho xuất Excel và PDF phiếu lương
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─────────────────────────────────────────────────────────────────────────────
// 1. XUẤT EXCEL — Toàn bộ bảng lương trong một tháng (dành cho HR/Admin)
// ─────────────────────────────────────────────────────────────────────────────
export async function exportPayrollToExcel(payrolls, month, year) {

    const sheetData = [
        // Header row
        [
            'STT',
            'Mã NV',
            'Họ và Tên',
            'Lương Cơ Bản (đ)',
            'Ngày Công Chuẩn',
            'Ngày Công Thực Tế',
            'Phụ Cấp (đ)',
            'Khấu Trừ (đ)',
            'Thưởng/Phạt (đ)',
            'Lý Do Điều Chỉnh',
            'Thực Nhận NET (đ)',
            'Trạng Thái',
        ],
        // Data rows
        ...payrolls.map((p, idx) => [
            idx + 1,
            p.employeeID,
            p.fullName || 'N/A',
            p.baseSalary || 0,
            p.standardWorkDays || 0,
            p.actualWorkDays || 0,
            p.totalAllowance || 0,
            p.totalDeduction || 0,
            p.adjustmentAmount || 0,
            p.adjustmentReason || '',
            p.finalNetSalary || 0,
            p.status || 'DRAFT',
        ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Style cột rộng hơn cho dễ đọc
    worksheet['!cols'] = [
        { wch: 5 },  // STT
        { wch: 8 },  // Mã NV
        { wch: 25 }, // Họ tên
        { wch: 18 }, // Lương cơ bản
        { wch: 16 }, // Ngày công chuẩn
        { wch: 18 }, // Ngày công thực tế
        { wch: 15 }, // Phụ cấp
        { wch: 15 }, // Khấu trừ
        { wch: 16 }, // Thưởng/phạt
        { wch: 30 }, // Lý do
        { wch: 20 }, // Thực nhận
        { wch: 12 }, // Trạng thái
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Luong T${month}-${year}`);

    // Tên file: BangLuong_T02_2026.xlsx
    const fileName = `BangLuong_T${String(month).padStart(2, '0')}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. IN PDF PHIẾU LƯƠNG CÁ NHÂN — Dành cho nhân viên xem lương của mình
// ─────────────────────────────────────────────────────────────────────────────

// Helper function to load font as base64
async function loadFont(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.readAsDataURL(blob);
    });
}

export async function exportPayslipToPDF(payroll, employeeName = '') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // --- Font Registration (Vietnamese Support) ---
    try {
        const fontRegular = await loadFont('/fonts/Tahoma.ttf');
        const fontBold = await loadFont('/fonts/Tahoma-Bold.ttf');
        
        doc.addFileToVFS('Tahoma.ttf', fontRegular);
        doc.addFont('Tahoma.ttf', 'Tahoma', 'normal');
        
        doc.addFileToVFS('Tahoma-Bold.ttf', fontBold);
        doc.addFont('Tahoma-Bold.ttf', 'Tahoma', 'bold');
        
        doc.setFont('Tahoma');
    } catch (err) {
        console.warn("Could not load premium fonts, falling back to Courier", err);
        doc.setFont('courier');
    }

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 15;

    // --- Professional Header ---
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageW, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Tahoma', 'bold');
    doc.setFontSize(18);
    doc.text('HỆ THỐNG QUẢN TRỊ NHÂN SỰ G3', margin, 22);
    
    doc.setFontSize(9);
    doc.setFont('Tahoma', 'normal');
    doc.text('G3 TECHNOLOGY SOLUTIONS - PHIẾU LƯƠNG NHÂN VIÊN', margin, 29);

    doc.setFontSize(14);
    doc.setFont('Tahoma', 'bold');
    doc.text('PHIẾU LƯƠNG CHI TIẾT', pageW - margin, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Kỳ lương: Tháng ${payroll.month} / ${payroll.year}`, pageW - margin, 29, { align: 'right' });

    y = 52;
    doc.setTextColor(30, 41, 59); // Slate-800

    // --- Employee Info Block ---
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(margin, y, pageW - margin * 2, 25, 2, 2, 'FD');

    doc.setFont('Tahoma', 'bold');
    doc.setFontSize(11);
    doc.text('THÔNG TIN NHÂN VIÊN', margin + 6, y + 8);

    doc.setFont('Tahoma', 'normal');
    doc.setFontSize(9);
    doc.text(`Họ và tên:`, margin + 6, y + 16);
    doc.setFont('Tahoma', 'bold');
    doc.text(`${employeeName || 'N/A'}`, margin + 25, y + 16);

    doc.setFont('Tahoma', 'normal');
    doc.text(`Mã nhân viên:`, pageW / 2, y + 16);
    doc.setFont('Tahoma', 'bold');
    doc.text(`${payroll.employeeID || 'N/A'}`, pageW / 2 + 25, y + 16);

    y += 35;

    // --- Work Attendance Block ---
    const attendanceData = [
        ['Công chuẩn', `${payroll.standardWorkDays || 0} ngày`],
        ['Thực tế', `${payroll.actualWorkDays || 0} ngày`],
        ['Nghỉ phép', `${payroll.paidLeaveDays || 0} ngày`],
    ];

    autoTable(doc, {
        startY: y,
        head: [['CHỈ SỐ CÔNG', 'CHI TIẾT']],
        body: attendanceData,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], font: 'Tahoma', fontStyle: 'bold' },
        styles: { font: 'Tahoma', fontSize: 9 },
        margin: { left: margin, right: margin },
        columnStyles: { 1: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 10;

    // --- Earnings & Deductions Tables ---
    const fmt = (num) => Number(num || 0).toLocaleString('vi-VN') + ' đ';

    const earnings = [
        ['Lương cơ bản', fmt(payroll.baseSalary)],
        ['Tổng phụ cấp', fmt(payroll.totalAllowance)],
    ];

    if (payroll.adjustmentAmount > 0) {
        earnings.push([`Thưởng (${payroll.adjustmentReason || 'Điều chỉnh'})`, `+ ${fmt(payroll.adjustmentAmount)}`]);
    }

    const deductions = [
        ['Khấu trừ Bảo hiểm / Thuế', fmt(payroll.totalDeduction)],
    ];

    if (payroll.adjustmentAmount < 0) {
        deductions.push([`Khấu trừ khác (${payroll.adjustmentReason || 'Vi phạm'})`, `- ${fmt(Math.abs(payroll.adjustmentAmount))}`]);
    }

    // Combine into one main table with sections
    const tableBody = [
        [{ content: 'I. KHOẢN THU NHẬP (EARNINGS)', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
        ...earnings,
        [{ content: `Tổng cộng thu nhập:`, styles: { fontStyle: 'bold' } }, { content: fmt((payroll.baseSalary || 0) + (payroll.totalAllowance || 0) + (payroll.adjustmentAmount > 0 ? payroll.adjustmentAmount : 0)), styles: { fontStyle: 'bold', halign: 'right' } }],
        
        [{ content: 'II. KHOẢN KHẤU TRỪ (DEDUCTIONS)', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
        ...deductions,
        [{ content: `Tổng cộng khấu trừ:`, styles: { fontStyle: 'bold' } }, { content: fmt((payroll.totalDeduction || 0) + (payroll.adjustmentAmount < 0 ? Math.abs(payroll.adjustmentAmount) : 0)), styles: { fontStyle: 'bold', halign: 'right', textColor: [220, 38, 38] } }],
    ];

    autoTable(doc, {
        startY: y,
        head: [['DIỄN GIẢI', 'SỐ TIỀN']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], font: 'Tahoma', fontStyle: 'bold' },
        styles: { font: 'Tahoma', fontSize: 9, cellPadding: 4 },
        columnStyles: { 1: { halign: 'right', cellWidth: 50 } },
        margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 12;

    // --- Net Salary Summary Box ---
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.roundedRect(margin, y, pageW - margin * 2, 20, 1, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Tahoma', 'bold');
    doc.setFontSize(12);
    doc.text('TỔNG THỰC NHẬN (NET SALARY)', margin + 8, y + 12);
    
    doc.setFontSize(16);
    doc.text(fmt(payroll.finalNetSalary), pageW - margin - 8, y + 12, { align: 'right' });

    y += 35;

    // --- Notes & Footer ---
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFontSize(8);
    doc.setFont('Tahoma', 'italic');
    doc.text('Lưu ý: Phiếu lương này được bảo mật và chỉ cung cấp cho nhân viên có tên trên.', margin, y);
    doc.text('Mọi thắc mắc vui lòng phản hồi phòng Nhân sự trong vòng 03 ngày làm việc kể từ khi nhận phiếu.', margin, y + 5);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 15, pageW - margin, y + 15);
    
    doc.setFont('Tahoma', 'normal');
    doc.text(`Ngày in: ${new Date().toLocaleString('vi-VN')}`, pageW / 2, y + 22, { align: 'center' });

    // Save PDF
    const fileName = `PhieuLuong_${(employeeName || 'NV').replace(/\s+/g, '_')}_T${payroll.month}_${payroll.year}.pdf`;
    doc.save(fileName);
}

