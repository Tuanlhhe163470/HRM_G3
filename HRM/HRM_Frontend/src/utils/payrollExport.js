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
export async function exportPayslipToPDF(payroll, employeeName = '') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // ── Header công ty ────────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('HRM SYSTEM', margin, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Human Resource Management', margin, 19);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYSLIP / PHIEU LUONG', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Thang ${payroll.month} / ${payroll.year}`,
        pageW / 2, 19, { align: 'center' }
    );

    // Ngày in
    const today = new Date().toLocaleDateString('vi-VN');
    doc.setFontSize(8);
    doc.text(`Ngay in: ${today}`, pageW - margin, 19, { align: 'right' });

    y = 36;
    doc.setTextColor(30, 30, 30);

    // ── Thông tin nhân viên ───────────────────────────────────────────────────
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('THONG TIN NHAN VIEN', margin + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Ho ten  : ${employeeName || 'N/A'}`, margin + 4, y + 14);
    doc.text(`Ma NV   : ${payroll.employeeID || 'N/A'}`, pageW / 2, y + 14);

    y += 28;

    // ── Bảng chi tiết lương ───────────────────────────────────────────────────
    const earnings = (payroll.baseSalary || 0) + (payroll.totalAllowance || 0) +
        (payroll.adjustmentAmount > 0 ? payroll.adjustmentAmount : 0);
    const deductions = (payroll.totalDeduction || 0) +
        (payroll.adjustmentAmount < 0 ? Math.abs(payroll.adjustmentAmount) : 0);

    const fmt = (num) => Number(num || 0).toLocaleString('vi-VN') + ' d';

    const tableBody = [
        // — Thu nhập —
        [{ content: 'THU NHAP (EARNINGS)', colSpan: 2, styles: { fillColor: [220, 252, 231], fontStyle: 'bold', textColor: [22, 101, 52] } }],
        ['Luong co ban (Base Salary)', fmt(payroll.baseSalary)],
        ['Phu cap (Allowances)', fmt(payroll.totalAllowance)],
    ];

    if (payroll.adjustmentAmount > 0) {
        tableBody.push([
            `Thuong/Bonus${payroll.adjustmentReason ? ' - ' + payroll.adjustmentReason : ''}`,
            `+ ${fmt(payroll.adjustmentAmount)}`
        ]);
    }

    tableBody.push(
        [{ content: `Tong Thu Nhap: ${fmt(earnings)}`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 253, 244] } }],

        // — Khấu trừ —
        [{ content: 'KHAU TRU (DEDUCTIONS)', colSpan: 2, styles: { fillColor: [254, 226, 226], fontStyle: 'bold', textColor: [185, 28, 28] } }],
        ['Khau tru co dinh (Thue/BHXH)', fmt(payroll.totalDeduction)],
    );

    if (payroll.adjustmentAmount < 0) {
        tableBody.push([
            `Phat/Penalty${payroll.adjustmentReason ? ' - ' + payroll.adjustmentReason : ''}`,
            `- ${fmt(Math.abs(payroll.adjustmentAmount))}`
        ]);
    }

    tableBody.push(
        [{ content: `Tong Khau Tru: ${fmt(deductions)}`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 241, 242] } }],
    );

    autoTable(doc, {
        startY: y,
        head: [['Khoan Muc', 'So Tien']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 110 },
            1: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: margin, right: margin },
    });

    y = doc.lastAutoTable.finalY + 6;

    // ── NET SALARY box ────────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, y, pageW - margin * 2, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('THUC NHAN (NET SALARY)', margin + 6, y + 10);
    doc.setFontSize(13);
    doc.text(fmt(payroll.finalNetSalary), pageW - margin - 4, y + 10, { align: 'right' });

    y += 22;
    doc.setTextColor(30, 30, 30);

    // ── Thông tin công ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `Ngay cong: ${payroll.actualWorkDays || 0} / ${payroll.standardWorkDays || 0} ngay   |   Trang thai: ${(payroll.status || 'DRAFT').toUpperCase()}`,
        pageW / 2, y, { align: 'center' }
    );

    y += 10;

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
        'Phieu luong nay duoc tao tu dong tu He thong HRM. Moi thac mac lien he phong Nhan Su.',
        pageW / 2, y, { align: 'center' }
    );

    // ── Tên file ──────────────────────────────────────────────────────────────
    const empId = payroll.employeeID || 'NV';
    const fileName = `PhieuLuong_${empId}_T${String(payroll.month).padStart(2, '0')}_${payroll.year}.pdf`;
    doc.save(fileName);
}
