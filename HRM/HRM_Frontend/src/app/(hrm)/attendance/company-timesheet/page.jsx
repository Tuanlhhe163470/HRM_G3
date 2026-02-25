"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx"; // Import toàn bộ công cụ của SheetJS
import { FileExcelOutlined } from "@ant-design/icons"; // Thêm icon Excel cho đẹp
import timesheetService from "@/services/TimeAndAttendance/timesheetService";
import { 
  SearchOutlined, 
  BankOutlined, 
  FilterOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CaretRightOutlined
} from "@ant-design/icons";

export default function CompanyTimesheetPage() {
  // 1. STATE DỮ LIỆU TỪ BACKEND
  const [timesheets, setTimesheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // 2. STATE CHO CÁC BỘ LỌC (FILTERS & SEARCH)
  const [month, setMonth] = useState(2); 
  const [year, setYear] = useState(2026);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  // Tính số ngày để vẽ Table Header
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Gọi API lấy dữ liệu
  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const response = await timesheetService.getCompanyTimesheets(month, year);
      setTimesheets(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động gọi API khi đổi Tháng hoặc Năm
  useEffect(() => {
    fetchTimesheets();
  }, [month, year]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      await timesheetService.calculateTimesheets(month, year);
      fetchTimesheets();
    } catch (error) {
      alert("Lỗi khi tính toán!");
    } finally {
      setIsCalculating(false);
    }
  };

  // 3. LOGIC LẤY DANH SÁCH PHÒNG BAN & TRẠNG THÁI ĐỘNG CÓ TRONG DATA
  const departments = useMemo(() => ["Tất cả", ...new Set(timesheets.map(t => t.departmentName).filter(Boolean))], [timesheets]);
  const statuses = useMemo(() => ["Tất cả", ...new Set(timesheets.map(t => t.status).filter(Boolean))], [timesheets]);

  // 4. LOGIC LỌC DỮ LIỆU SIÊU TỐC TRÊN FRONTEND (DERIVED STATE)
  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((emp) => {
      // Lọc Search (Theo ID, Tên, Chức vụ)
      const keyword = searchTerm.toLowerCase();
      const matchSearch = 
        emp.employeeName.toLowerCase().includes(keyword) ||
        emp.employeeID.toString().includes(keyword) ||
        emp.positionName.toLowerCase().includes(keyword);

      // Lọc Dropdown
      const matchDept = selectedDept === "Tất cả" || emp.departmentName === selectedDept;
      const matchStatus = selectedStatus === "Tất cả" || emp.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }, [timesheets, searchTerm, selectedDept, selectedStatus]);

  // Vẽ viên thuốc trạng thái
  const renderStatusPill = (status) => {
    switch (status) {
      case "P": return <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-emerald-50 text-emerald-600 border-emerald-200">P</div>;
      case "L": return <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-amber-50 text-amber-600 border-amber-200">L</div>;
      case "A": return <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-rose-50 text-rose-600 border-rose-200">A</div>;
      case "H": return <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-slate-100 text-slate-500 border-slate-200">H</div>;
      case "LE": return <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-blue-50 text-blue-600 border-blue-200">LE</div>;
      default: return null;
    }
  };

  // 5. LOGIC XUẤT FILE EXCEL (Xử lý 100% trên Client)
  const handleExportExcel = () => {
    if (filteredTimesheets.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // A. BIẾN ĐỔI DỮ LIỆU JSON THÀNH FORMAT BẢNG EXCEL
    const excelData = filteredTimesheets.map((emp, index) => {
      // Các cột thông tin cơ bản
      let rowData = {
        "STT": index + 1,
        "Mã NV": emp.employeeID,
        "Họ tên": emp.employeeName,
        "Phòng ban": emp.departmentName,
        "Chức vụ": emp.positionName,
      };

      // Bung Ma trận 31 ngày ra thành 31 cột
      daysArray.forEach(day => {
        // Ví dụ: Tạo cột "Ngày 01", "Ngày 02"... chứa ký tự P, L, A
        const dayString = day.toString().padStart(2, '0');
        rowData[`Ngày ${dayString}`] = emp.dailyStatuses && emp.dailyStatuses[day] ? emp.dailyStatuses[day] : "";
      });

      // Bổ sung các cột Tổng kết ở cuối
      rowData["Ngày công chuẩn"] = emp.standardWorkDays;
      rowData["Thực tế đi làm"] = emp.actualWorkDays;
      rowData["Nghỉ có lương"] = emp.paidLeaveDays;
      rowData["Nghỉ không lương"] = emp.unpaidLeaveDays;
      rowData["Tổng giờ (h)"] = emp.totalWorkingHours;
      rowData["Trễ (phút)"] = emp.totalLateMinutes;
      rowData["Về sớm (phút)"] = emp.totalEarlyLeaveMinutes;

      return rowData;
    });

    // B. KHỞI TẠO WORKBOOK VÀ WORKSHEET BẰNG SHEETJS
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Căn chỉnh nhanh độ rộng cột (UX cho người xem Excel)
    const wscols = [
      { wch: 5 },  // STT
      { wch: 10 }, // Mã NV
      { wch: 25 }, // Họ tên
      { wch: 25 }, // Phòng ban
      { wch: 20 }, // Chức vụ
    ];
    // Các cột ngày cho bé lại
    daysArray.forEach(() => wscols.push({ wch: 8 }));
    worksheet['!cols'] = wscols;

    // Gắn Sheet vào Book
    XLSX.utils.book_append_sheet(workbook, worksheet, `T${month}_${year}`);

    // C. TẢI FILE XUỐNG MÁY
    XLSX.writeFile(workbook, `Bang_Cham_Cong_Thang_${month}_${year}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Bảng công toàn công ty</h2>
          <p className="text-sm text-slate-500">Quản lý và chốt công toàn công ty</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTimesheets} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
            <ReloadOutlined className="mr-2" /> Làm mới
          </button>
          <button 
            onClick={handleExportExcel} 
            className="px-4 py-2 border border-emerald-600 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 transition-colors"
          >
            <FileExcelOutlined className="mr-2" /> Xuất Excel
          </button>
          <button 
            onClick={handleCalculate} 
            disabled={isCalculating}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCalculating ? "Đang tính..." : <><CaretRightOutlined /> Tính toán công</>}
          </button>
        </div>
      </div>

      {/* FILTER BAR (Được xây dựng theo đúng bản thiết kế của bạn) */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
        
        {/* Lọc Tháng / Năm */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <CalendarOutlined className="text-slate-400 mr-2" />
          <input 
            type="month" 
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={`${year}-${month.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setYear(parseInt(y));
              setMonth(parseInt(m));
            }}
          />
        </div>

        {/* Lọc Phòng Ban */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <BankOutlined className="text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600 mr-2">Phòng ban:</span>
          <select 
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>

        {/* Lọc Trạng Thái */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <FilterOutlined className="text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600 mr-2">Trạng thái:</span>
          <select 
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        {/* Thanh dọc ngăn cách */}
        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* Ô Search */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm flex-1 max-w-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <SearchOutlined className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, phòng ban, vị trí nhân viên" 
            className="w-full text-sm outline-none text-slate-700 bg-transparent placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* MATRIX TABLE */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500">Đang tải dữ liệu...</div>
        ) : filteredTimesheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
            <SearchOutlined className="text-3xl mb-2 text-slate-300" />
            Không tìm thấy nhân viên nào phù hợp.
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-4 py-3 border-b border-r border-slate-200 text-xs font-semibold text-slate-600 w-64 min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Nhân viên ({filteredTimesheets.length})
                </th>
                {daysArray.map(day => (
                  <th key={day} className="px-1 py-3 border-b border-r border-slate-200 text-[10px] text-center text-slate-500 w-10">
                    {day}
                  </th>
                ))}
                <th className="sticky right-0 bg-slate-50 px-4 py-3 border-b border-l border-slate-200 text-xs font-semibold text-slate-600 text-right w-24 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Tổng giờ
                </th>
              </tr>
            </thead>
            <tbody>
              {/* LƯU Ý: Đã thay timesheets.map thành filteredTimesheets.map */}
              {filteredTimesheets.map((emp) => (
                <tr key={emp.employeeID} className="hover:bg-slate-50/50 group">
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 px-4 py-2 border-b border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="font-medium text-slate-800">{emp.employeeName}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{emp.departmentName}</span>
                      <span className="font-mono bg-slate-100 px-1 rounded text-slate-400">#{emp.employeeID}</span>
                    </div>
                  </td>
                  
                  {daysArray.map(day => (
                    <td key={day} className="border-b border-r border-slate-100 p-1">
                      <div className="flex justify-center">
                        {renderStatusPill(emp.dailyStatuses && emp.dailyStatuses[day])}
                      </div>
                    </td>
                  ))}
                  
                  <td className="sticky right-0 bg-white group-hover:bg-slate-50/50 px-4 py-2 border-b border-l border-slate-200 text-right shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="font-bold text-slate-700">{emp.totalWorkingHours}h</div>
                    {emp.totalLateMinutes > 0 && <div className="text-[9px] font-medium text-amber-500">Trễ {emp.totalLateMinutes}p</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}