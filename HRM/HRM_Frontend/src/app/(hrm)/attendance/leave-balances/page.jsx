"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SearchOutlined,
  CalendarOutlined,
  ReloadOutlined,
  EditOutlined,
  PlusCircleOutlined,
  HistoryOutlined
} from "@ant-design/icons";

import leaveBalanceService from "@/services/TimeAndAttendance/leaveBalanceService";
import useNotice from "@/components/Notice";

export default function LeaveBalancesPage() {
  const notice = useNotice();
  const currentYear = new Date().getFullYear();

  // ==========================================
  // 1. STATES
  // ==========================================
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const [year, setYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Điều chỉnh phép
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ newTotalDays: 0, reason: "" });

  // ==========================================
  // 2. FETCH DATA
  // ==========================================
  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      const res = await leaveBalanceService.getAllBalances({ year });
      setBalances(res.data?.data || res.data || []);
    } catch (error) {
      notice({ msg: "Lỗi tải dữ liệu", desc: "Không lấy được danh sách quỹ phép", isSuccess: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [year]);

  // ==========================================
  // 3. ACTIONS LOGIC
  // ==========================================
  const handleGenerateBalances = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn quét và cấp quỹ phép tự động cho các nhân viên trong năm ${year} không?`)) return;

    setIsGenerating(true);
    try {
      await leaveBalanceService.generateBalances({ year: year, defaultDays: 12, leaveTypeId: 1 });
      notice({ msg: "Thành công", desc: `Đã khởi tạo quỹ phép cho năm ${year}`, isSuccess: true });
      fetchBalances();
    } catch (error) {
      notice({ msg: "Thất bại", desc: error.response?.data?.message || "Lỗi khởi tạo", isSuccess: false });
    } finally {
      setIsGenerating(false);
    }
  };

  const openAdjustModal = (balance) => {
    setSelectedBalance(balance);
    setAdjustForm({ newTotalDays: balance.totalDays, reason: "" });
    setIsModalOpen(true);
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    setIsAdjusting(true);
    try {
      await leaveBalanceService.adjustBalance(selectedBalance.id, adjustForm);
      notice({ msg: "Cập nhật thành công", desc: "Đã điều chỉnh số ngày phép.", isSuccess: true });
      setIsModalOpen(false);
      fetchBalances();
    } catch (error) {
      notice({ msg: "Lỗi", desc: error.response?.data?.message || "Không thể điều chỉnh.", isSuccess: false });
    } finally {
      setIsAdjusting(false);
    }
  };

  // ==========================================
  // 4. FRONT-END FILTER (SEARCH)
  // ==========================================
  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const keyword = searchTerm.toLowerCase();
      // Ánh xạ theo cấu trúc DTO mới từ Backend
      const empName = (b.employeeName || "").toLowerCase();
      const empCode = (b.employeeId || "").toString().toLowerCase();
      const deptName = (b.departmentName || "").toLowerCase();
      const posName = (b.positionName || "").toLowerCase();

      return empName.includes(keyword) || empCode.includes(keyword) || deptName.includes(keyword) || posName.includes(keyword);
    });
  }, [balances, searchTerm]);

  // ==========================================
  // 5. RENDER UI
  // ==========================================
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">

      {/* HEADER BAR */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý Quỹ phép năm</h2>
          <p className="text-sm text-slate-500">Cấp phát và điều chỉnh quỹ phép cho nhân viên</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBalances} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
            <ReloadOutlined className="mr-2" /> Làm mới
          </button>

          <button
            onClick={handleGenerateBalances}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center shadow-sm"
          >
            {isGenerating ? "Đang xử lý..." : <><PlusCircleOutlined className="mr-2" /> Cấp phép tự động năm {year}</>}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
          <CalendarOutlined className="text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-600 mr-2">Năm:</span>
          <input
            type="number"
            className="text-sm text-slate-700 outline-none bg-transparent w-20 font-bold"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        <div className="flex items-center border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm flex-1 max-w-md focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <SearchOutlined className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, phòng ban..."
            className="w-full text-sm outline-none text-slate-700 bg-transparent placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500">Đang tải dữ liệu quỹ phép...</div>
        ) : filteredBalances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
            <HistoryOutlined className="text-3xl mb-2 text-slate-300" />
            Không tìm thấy dữ liệu.
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse rounded-lg overflow-hidden ring-1 ring-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 w-16 text-center">Mã NV</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thông tin Nhân viên</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Tổng được cấp</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Đã dùng</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Còn lại</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map((item) => {
                // Nếu chưa cấp phép, cho bằng 0 để tránh lỗi hiển thị NaN
                const remaining = item.isAllocated ? (item.totalDays - item.usedDays) : 0;
                
                return (
                  <tr key={item.employeeId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-500 font-mono font-medium">#{item.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{item.employeeName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.positionName} {item.departmentName ? `• ${item.departmentName}` : ""}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      {item.isAllocated ? (
                         <span className="font-bold text-slate-700">{item.totalDays}</span>
                      ) : (
                         <span className="text-xs italic text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">Chưa cấp phép</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      {item.isAllocated ? (
                        <span className="font-semibold text-orange-600">{item.usedDays}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      {item.isAllocated ? (
                        <span className={`font-black ${remaining <= 0 ? "text-red-500" : "text-emerald-600"}`}>
                          {remaining}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openAdjustModal(item)}
                        disabled={!item.isAllocated}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title={item.isAllocated ? "Điều chỉnh tay" : "Vui lòng cấp phép trước khi điều chỉnh"}
                      >
                        <EditOutlined />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg mb-1 text-slate-800">Điều chỉnh phép ngoại lệ</h3>
            <p className="text-sm text-slate-500 mb-4">
              Nhân viên: <span className="font-bold text-slate-700">{selectedBalance?.employeeName}</span>
            </p>

            <form onSubmit={submitAdjust} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tổng số ngày phép MỚI</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" step="0.5" min={selectedBalance?.usedDays || 0} required
                    className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg text-indigo-700"
                    value={adjustForm.newTotalDays}
                    onChange={e => setAdjustForm({ ...adjustForm, newTotalDays: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-sm text-slate-500 font-medium whitespace-nowrap">ngày / năm</span>
                </div>
                <p className="text-xs text-orange-600 mt-1 italic">
                  *Không được thấp hơn số ngày đã dùng ({selectedBalance?.usedDays}).
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do điều chỉnh (Bắt buộc)</label>
                <textarea
                  placeholder="Ví dụ: Thưởng thâm niên 1 ngày phép..." required
                  className="w-full border border-slate-300 p-2 rounded h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                  value={adjustForm.reason}
                  onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAdjusting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}