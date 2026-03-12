"use client";
import React, { useState, useEffect } from 'react';
import { advanceService } from '@/services/SalaryAdvance/advanceService';

// Các role được phép vào trang này
const ALLOWED_ROLES = ['Manager', 'HR', 'Admin'];

export default function ManagerApprovalPage() {
    const [userRole, setUserRole] = useState(null);
    const [roleChecked, setRoleChecked] = useState(false);

    const [activeTab, setActiveTab] = useState('pending');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Kiểm tra role khi mount
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                setUserRole(userObj.roleName || userObj.role || '');
            }
        } catch (e) { /* bỏ qua lỗi */ }
        setRoleChecked(true);
    }, []);

    // Chỉ tải data khi đã xác nhận có quyền
    useEffect(() => {
        if (roleChecked && ALLOWED_ROLES.includes(userRole)) {
            loadPendingRequests();
        }
    }, [roleChecked, userRole]);

    useEffect(() => {
        if (activeTab === 'history' && ALLOWED_ROLES.includes(userRole)) {
            loadAllRequests();
        }
    }, [activeTab]);

    const loadPendingRequests = async () => {
        setLoadingPending(true);
        try {
            const res = await advanceService.getPendingRequests();
            setPendingRequests(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        } finally {
            setLoadingPending(false);
        }
    };

    const loadAllRequests = async () => {
        setLoadingAll(true);
        try {
            const res = await advanceService.getAllRequests();
            setAllRequests(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoadingAll(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn duyệt đơn ứng lương này?")) return;
        try {
            await advanceService.processRequest(id, { isApproved: true, managerNote: "Đồng ý duyệt" });
            alert("Đã duyệt thành công!");
            loadPendingRequests();
            if (activeTab === 'history') loadAllRequests();
        } catch (error) {
            alert("Lỗi khi duyệt đơn.");
        }
    };

    const openRejectModal = (req) => {
        setSelectedRequest(req);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối để nhân viên được biết!");
            return;
        }
        try {
            await advanceService.processRequest(selectedRequest.advanceID, {
                isApproved: false,
                managerNote: rejectReason
            });
            alert("Đã từ chối đơn ứng lương.");
            setIsRejectModalOpen(false);
            loadPendingRequests();
            if (activeTab === 'history') loadAllRequests();
        } catch (error) {
            alert("Lỗi khi xử lý.");
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            APPROVED: 'bg-green-100 text-green-700 border border-green-200',
            REJECTED: 'bg-red-100 text-red-700 border border-red-200',
        };
        const labels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };
        return (
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // ── Đang kiểm tra quyền ──
    if (!roleChecked) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-400 italic">
                Đang xác thực quyền truy cập...
            </div>
        );
    }

    // ── Không có quyền ──
    if (!ALLOWED_ROLES.includes(userRole)) {
        return (
            <div className="p-6 max-w-6xl mx-auto font-sans">
                <div className="flex flex-col items-center justify-center h-72 bg-red-50 rounded-2xl border border-red-200">
                    <div className="text-5xl mb-4">🚫</div>
                    <h2 className="text-xl font-black text-red-700 mb-2">Không có quyền truy cập</h2>
                    <p className="text-sm text-red-500">
                        Trang này chỉ dành cho <strong>Manager / HR / Admin</strong>.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Role hiện tại của bạn: <code className="bg-gray-100 px-1 rounded">{userRole || 'Không xác định'}</code>
                    </p>
                </div>
            </div>
        );
    }

    // ── Có quyền: Manager / HR / Admin ──
    return (
        <div className="p-6 max-w-6xl mx-auto font-sans relative">
            <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-wider">Quản Lý Đơn Ứng Lương</h1>

            {/* Tab điều hướng */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2.5 font-bold text-sm rounded-t-lg transition-colors ${
                        activeTab === 'pending'
                            ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    ⏳ Chờ duyệt
                    {pendingRequests.length > 0 && (
                        <span className="ml-2 bg-yellow-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2.5 font-bold text-sm rounded-t-lg transition-colors ${
                        activeTab === 'history'
                            ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    📋 Lịch sử tất cả đơn
                </button>
            </div>

            {/* Tab: Chờ duyệt */}
            {activeTab === 'pending' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Nhân viên</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Ngày gửi</th>
                                <th className="px-4 py-3 text-right font-bold text-gray-600">Số tiền xin ứng</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Lý do của nhân viên</th>
                                <th className="px-4 py-3 text-center font-bold text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loadingPending ? (
                                <tr><td colSpan="5" className="text-center py-10 italic text-gray-400">Đang tải...</td></tr>
                            ) : pendingRequests.length > 0 ? pendingRequests.map((item) => (
                                <tr key={item.advanceID} className="hover:bg-blue-50/50">
                                    <td className="px-4 py-4 font-bold text-gray-800">{item.employeeName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{new Date(item.requestDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-4 text-right font-mono font-bold text-blue-600">{item.amount?.toLocaleString()} đ</td>
                                    <td className="px-4 py-4 max-w-sm">
                                        <div className="bg-gray-100 p-2 rounded text-xs italic text-gray-700">
                                            "{item.reason}"
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleApprove(item.advanceID)}
                                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded shadow-sm"
                                            >
                                                DUYỆT
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(item)}
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm"
                                            >
                                                TỪ CHỐI
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-400">
                                        Không có đơn ứng lương nào đang chờ duyệt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Lịch sử tất cả đơn */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Nhân viên</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Ngày gửi</th>
                                <th className="px-4 py-3 text-right font-bold text-gray-600">Số tiền</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Lý do nhân viên</th>
                                <th className="px-4 py-3 text-center font-bold text-gray-600">Trạng thái</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Ghi chú của Manager</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600">Ngày xử lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loadingAll ? (
                                <tr><td colSpan="7" className="text-center py-10 italic text-gray-400">Đang tải lịch sử...</td></tr>
                            ) : allRequests.length > 0 ? allRequests.map((item) => (
                                <tr key={item.advanceID} className="hover:bg-blue-50/30">
                                    <td className="px-4 py-4 font-bold text-gray-800">{item.employeeName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">{new Date(item.requestDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-4 text-right font-mono font-bold text-blue-600">{item.amount?.toLocaleString()} đ</td>
                                    <td className="px-4 py-4 max-w-[180px] truncate text-gray-700 italic text-xs">"{item.reason}"</td>
                                    <td className="px-4 py-4 text-center">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-500 max-w-[180px] break-words">
                                        {item.managerNote || <span className="italic text-gray-300">Chưa có</span>}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-xs">
                                        {item.approvalDate
                                            ? new Date(item.approvalDate).toLocaleDateString('vi-VN')
                                            : <span className="italic text-gray-300">—</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-400">
                                        Chưa có lịch sử đơn ứng lương nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL TỪ CHỐI — Bắt buộc nhập lý do */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Từ chối ứng lương</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Đơn xin ứng <strong>{selectedRequest?.amount?.toLocaleString()} đ</strong> của <strong>{selectedRequest?.employeeName}</strong>
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Hãy cho nhân viên biết lý do vì sao đơn không được duyệt (Bắt buộc)..."
                                className="w-full p-3 border border-red-200 rounded-xl h-24 focus:ring-2 focus:ring-red-500 outline-none bg-red-50"
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl"
                            >
                                Xác nhận Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}