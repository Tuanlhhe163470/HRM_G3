"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileExcelOutlined,
  SearchOutlined,
  BankOutlined,
  FilterOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import timesheetService from "@/services/TimeAndAttendance/timesheetService";
import useNotice from "@/components/Notice";

export default function CompanyTimesheetPage() {
  const notice = useNotice();

  /**
   * ==========================================
   * 1. STATE QUẢN LÝ DỮ LIỆU CHÍNH & TRẠNG THÁI
   * ==========================================
   */
  const [timesheets, setTimesheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * ==========================================
   * 2. STATE QUẢN LÝ BỘ LỌC (FILTERS)
   * ==========================================
   */
  // Lấy thời gian thực tại thời điểm HR mở trang web
  const currentDate = new Date();

  // getMonth() của JavaScript chạy từ 0-11 (Tháng 1 là 0), nên phải + 1
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [isLocking, setIsLocking] = useState(false);

  // Tính toán linh hoạt số ngày trong tháng hiện tại để vẽ số cột tương ứng trong bảng (28, 29, 30 hoặc 31 ngày)
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /**
   * FETCH DATA LOGIC
   * Lấy dữ liệu chấm công tổng hợp từ server.
   */
  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const response = await timesheetService.getCompanyTimesheets(month, year);
      // Phòng thủ: Nếu API lỗi hoặc trả null, fallback về mảng rỗng để tránh lỗi crash .filter() bên dưới
      setTimesheets(response?.data || []);
    } catch (error) {
      console.error("[TimesheetPage] fetch error:", error);
      notice({
        msg: "Lỗi tải dữ liệu",
        desc: "Không thể lấy dữ liệu bảng công. Vui lòng thử lại.",
        isSuccess: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động trigger lấy dữ liệu mới mỗi khi người dùng đổi bộ lọc Thời gian
  useEffect(() => {
    fetchTimesheets();
  }, [month, year]);

  /**
   * BUSINESS ACTION
   * Kích hoạt server tính toán lại dữ liệu chấm công (Chạy lại logic chấm công, duyệt đơn...).
   */
  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      await timesheetService.calculateTimesheets(month, year);
      notice({
        msg: "Hoàn tất",
        desc: `Đã tính toán xong...`,
        isSuccess: true,
      });
      fetchTimesheets();
    } catch (error) {
      // Sửa chỗ này
      notice({
        msg: "Lỗi tính toán",
        desc:
          error.response?.data?.message ||
          "Hệ thống gặp sự cố khi tính toán công.",
        isSuccess: false,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Nếu Enum Locked của bạn là 3 hoặc chữ "Locked"
  const isMonthLocked =
    timesheets.length > 0 &&
    (timesheets[0].status === 3 || timesheets[0].status === "Locked");

  const handleLockTimesheet = async () => {
    if (
      !window.confirm(
        `⚠️ BẠN CÓ CHẮC CHẮN MUỐN KHÓA SỔ THÁNG ${month}/${year}?\n\nSau khi khóa, toàn bộ dữ liệu sẽ đóng băng và không thể thay đổi, kể cả khi có đơn giải trình mới.`,
      )
    ) {
      return;
    }

    setIsLocking(true);
    try {
      await timesheetService.lockTimesheets(month, year);

      notice({
        msg: "Khóa sổ thành công",
        desc: `Dữ liệu tháng ${month}/${year} đã được niêm phong an toàn.`,
        isSuccess: true,
      });

      fetchTimesheets(); // Tải lại để cập nhật trạng thái UI
    } catch (error) {
      notice({
        msg: "Không thể khóa sổ",
        desc: error.response?.data?.message || "Lỗi hệ thống.",
        isSuccess: false,
      });
    } finally {
      setIsLocking(false);
    }
  };
  /**
   * ==========================================
   * 3. LOGIC XÂY DỰNG DROPDOWN ĐỘNG
   * ==========================================
   * Trích xuất các phòng ban và trạng thái duy nhất (Unique) từ dữ liệu đang có.
   * Dùng useMemo để tránh việc loop mảng tốn kém mỗi lần render.
   */
  const departments = useMemo(
    () => [
      "Tất cả",
      ...new Set(timesheets.map((t) => t.departmentName).filter(Boolean)),
    ],
    [timesheets],
  );
  const statuses = useMemo(
    () => [
      "Tất cả",
      ...new Set(timesheets.map((t) => t.status).filter(Boolean)),
    ],
    [timesheets],
  );

  /**
   * ==========================================
   * 4. DERIVED STATE (LỌC DỮ LIỆU FRONT-END)
   * ==========================================
   * Xử lý tìm kiếm và lọc dữ liệu cực nhanh ngay trên máy khách thay vì gọi lại API.
   * Mọi ô nhập liệu (Search, Dept, Status) đều chạy qua bộ lọc này.
   */
  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((emp) => {
      // 4.1. Lọc theo từ khóa (hỗ trợ tìm Tên, Mã NV, hoặc Chức vụ)
      const keyword = searchTerm.toLowerCase();
      const matchSearch =
        emp.employeeName.toLowerCase().includes(keyword) ||
        emp.employeeID.toString().includes(keyword) ||
        emp.positionName.toLowerCase().includes(keyword);

      // 4.2. Lọc theo các Dropdown cấu hình
      const matchDept =
        selectedDept === "Tất cả" || emp.departmentName === selectedDept;
      const matchStatus =
        selectedStatus === "Tất cả" || emp.status === selectedStatus;

      // Trả về true nếu nhân viên thỏa mãn TẤT CẢ các điều kiện trên
      return matchSearch && matchDept && matchStatus;
    });
  }, [timesheets, searchTerm, selectedDept, selectedStatus]);

  // UI HELPER: Mapping các mã code trạng thái (P, L, A...) ra màu sắc tương ứng
  const renderStatusPill = (status) => {
    switch (status) {
      case "P":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-emerald-50 text-emerald-600 border-emerald-200"
            title="Present (Có mặt)"
          >
            P
          </div>
        );
      case "L":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-amber-50 text-amber-600 border-amber-200"
            title="Late (Đi muộn)"
          >
            L
          </div>
        );
      case "A":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-rose-50 text-rose-600 border-rose-200"
            title="Absent (Vắng mặt)"
          >
            A
          </div>
        );
      case "H":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-slate-100 text-slate-500 border-slate-200"
            title="Holiday (Ngày lễ)"
          >
            H
          </div>
        );
      case "LE":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-blue-50 text-blue-600 border-blue-200"
            title="Leave Early (Về sớm)"
          >
            LE
          </div>
        );
      case "V":
        return (
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm border bg-purple-50 text-blue-600 border-blue-200"
            title="Vacation (Nghỉ phép)"
          >
            V
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * ==========================================
   * 5. EXPORT LOGIC (CLIENT-SIDE)
   * ==========================================
   * Xử lý xuất Excel trực tiếp trên trình duyệt bằng thư viện SheetJS (xlsx),
   * tiết kiệm chi phí tính toán cho server.
   */
  const handleExportExcel = () => {
    if (filteredTimesheets.length === 0) {
      return notice({
        msg: "Không có dữ liệu",
        desc: "Lưới hiện tại đang trống, không có dữ liệu nào để xuất ra Excel.",
        isSuccess: false,
      });
    }

    try {
      // BƯỚC 1: Flatten dữ liệu (Trải phẳng JSON lồng nhau thành các cột ngang)
      const excelData = filteredTimesheets.map((emp, index) => {
        let rowData = {
          STT: index + 1,
          "Mã NV": emp.employeeID,
          "Họ tên": emp.employeeName,
          "Phòng ban": emp.departmentName,
          "Chức vụ": emp.positionName,
        };

        // Trải Object dailyStatuses (VD: { "1": "P", "2": "A" }) ra thành các cột riêng biệt
        daysArray.forEach((day) => {
          const dayString = day.toString().padStart(2, "0");
          rowData[`Ngày ${dayString}`] =
            emp.dailyStatuses && emp.dailyStatuses[day]
              ? emp.dailyStatuses[day]
              : "";
        });

        // Ghép các cột Thống kê tổng quan ở cuối file Excel
        rowData["Ngày công chuẩn"] = emp.standardWorkDays;
        rowData["Thực tế đi làm"] = emp.actualWorkDays;
        rowData["Nghỉ có lương"] = emp.paidLeaveDays;
        rowData["Nghỉ không lương"] = emp.unpaidLeaveDays;
        rowData["Tổng giờ (h)"] = emp.totalWorkingHours;
        rowData["Giờ OT (h)"] = emp.totalOvertimeHours;
        rowData["Trễ (phút)"] = emp.totalLateMinutes;
        rowData["Về sớm (phút)"] = emp.totalEarlyLeaveMinutes;

        return rowData;
      });

      // BƯỚC 2: Khởi tạo Workbook & Worksheet từ dữ liệu đã flatten
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();

      // UX Tweak: Mở rộng tự động (Autofit) độ rộng của một số cột quan trọng để text không bị khuất
      const wscols = [
        { wch: 5 }, // STT
        { wch: 10 }, // Mã NV
        { wch: 25 }, // Họ tên
        { wch: 25 }, // Phòng ban
        { wch: 20 }, // Chức vụ
      ];
      // Cột ngày thường rất hẹp, chỉ để hiển thị chữ P, A, L...
      daysArray.forEach(() => wscols.push({ wch: 8 }));
      worksheet["!cols"] = wscols;

      // BƯỚC 3: Gắn dữ liệu vào Book và gọi lệnh tải xuống
      XLSX.utils.book_append_sheet(workbook, worksheet, `T${month}_${year}`);
      XLSX.writeFile(workbook, `Bang_Cham_Cong_Thang_${month}_${year}.xlsx`);

      notice({
        msg: "Xuất file thành công",
        desc: "File Excel đã được tải xuống máy của bạn.",
        isSuccess: true,
      });
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      notice({
        msg: "Lỗi tạo file",
        desc: "Không thể tạo file Excel. Vui lòng thử lại sau.",
        isSuccess: false,
      });
    }
  };

  // ... (Phần RENDER JSX giữ nguyên hoàn toàn như bạn đã làm,
  // chỉ thay timesheets.map thành filteredTimesheets.map như code gốc của bạn)

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Bảng công toàn công ty
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý và chốt công toàn công ty
          </p>
        </div>
        <div className="flex gap-2">
          {isMonthLocked && (
            <span className="mr-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center border border-emerald-200">
              <CheckCircleOutlined className="mr-1" /> ĐÃ KHÓA SỔ
            </span>
          )}
          <button
            onClick={fetchTimesheets}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
          >
            <ReloadOutlined className="mr-2" /> Làm mới
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 border border-emerald-600 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 transition-colors"
          >
            <FileExcelOutlined className="mr-2" /> Xuất Excel
          </button>
          {!isMonthLocked && (
            <>
              <button
                onClick={handleCalculate}
                disabled={isCalculating || isLocking}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCalculating ? (
                  "Đang tính..."
                ) : (
                  <>
                    <CaretRightOutlined /> Tính toán công
                  </>
                )}
              </button>

              <button
                onClick={handleLockTimesheet}
                disabled={isCalculating || isLocking || timesheets.length === 0}
                className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center shadow-sm"
              >
                {isLocking ? (
                  "Đang khóa..."
                ) : (
                  <>
                    <LockOutlined className="mr-2" /> Khóa sổ
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
        {/* Lọc Tháng / Năm */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <CalendarOutlined className="text-slate-400 mr-2" />
          <input
            type="month"
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={`${year}-${month.toString().padStart(2, "0")}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-");
              setYear(parseInt(y));
              setMonth(parseInt(m));
            }}
          />
        </div>

        {/* Lọc Phòng Ban */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <BankOutlined className="text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600 mr-2">
            Phòng ban:
          </span>
          <select
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc Trạng Thái */}
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <FilterOutlined className="text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600 mr-2">
            Trạng thái:
          </span>
          <select
            className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
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
          <div className="flex items-center justify-center h-40 text-slate-500">
            Đang tải dữ liệu...
          </div>
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
                {daysArray.map((day) => (
                  <th
                    key={day}
                    className="px-1 py-3 border-b border-r border-slate-200 text-[10px] text-center text-slate-500 w-10"
                  >
                    {day}
                  </th>
                ))}
                <th className="sticky right-0 bg-slate-50 px-4 py-3 border-b border-l border-slate-200 text-xs font-semibold text-slate-600 text-right w-24 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Tổng giờ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((emp) => (
                <tr key={emp.employeeID} className="hover:bg-slate-50/50 group">
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 px-4 py-2 border-b border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="font-medium text-slate-800">
                      {emp.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{emp.departmentName}</span>
                      <span className="font-mono bg-slate-100 px-1 rounded text-slate-400">
                        #{emp.employeeID}
                      </span>
                    </div>
                  </td>

                  {daysArray.map((day) => (
                    <td
                      key={day}
                      className="border-b border-r border-slate-100 p-1"
                    >
                      <div className="flex justify-center">
                        {renderStatusPill(
                          emp.dailyStatuses && emp.dailyStatuses[day],
                        )}
                      </div>
                    </td>
                  ))}

                  <td className="sticky right-0 bg-white group-hover:bg-slate-50/50 px-4 py-2 border-b border-l border-slate-200 text-right shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="font-bold text-slate-700">
                      {emp.totalWorkingHours}h
                    </div>
                    {emp.totalOvertimeHours > 0 && (
                      <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 inline-block px-1 rounded">
                        + {emp.totalOvertimeHours}h OT
                      </div>
                    )}
                    {emp.totalLateMinutes > 0 && (
                      <div className="text-[9px] font-medium text-amber-500">
                        Trễ {emp.totalLateMinutes}p
                      </div>
                    )}
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
