"use client";
import React, { useState, useEffect } from 'react';
import { advanceService } from '@/services/SalaryAdvance/advanceService';

export default function AdvanceHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await advanceService.getMyHistory();
            setHistory(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto font-sans">
            <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-wider">Lịch sử ứng lương của bạn</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-gray-600">Ngày tạo</th>
                            <th className="px-4 py-4 text-right font-bold text-gray-600">Số tiền</th>
                            <th className="px-4 py-4 text-left font-bold text-gray-600">Lý do của bạn</th>
                            <th className="px-4 py-4 text-center font-bold text-gray-600">Trạng thái</th>
                            <th className="px-4 py-4 text-left font-bold text-gray-600">Ghi chú từ HR/Manager</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10 italic text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : history.length > 0 ? history.map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-700">
                                    {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-4 text-right font-mono font-bold text-blue-600 text-base">
                                    {item.amount?.toLocaleString()} đ
                                </td>
                                <td className="px-4 py-4 max-w-xs truncate text-gray-700">
                                    {item.reason}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
                                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                        item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                        {item.status === 'PENDING' ? 'Chờ duyệt' :
                                         item.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-xs italic text-gray-500 max-w-[200px] break-words">
                                    {item.managerNote || 'Chưa có ghi chú'}
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="text-center py-10 text-gray-400 font-medium">Chưa có lịch sử xin ứng lương nào.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}