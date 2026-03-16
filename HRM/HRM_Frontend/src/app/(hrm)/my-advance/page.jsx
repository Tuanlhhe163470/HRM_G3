"use client";
import React, { useState } from 'react';
import { advanceService } from '@/services/SalaryAdvance/advanceService';
import { useRouter } from 'next/navigation'; // Thêm thư viện chuyển trang

export default function EmployeeAdvancePage() {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return alert("Vui lòng nhập số tiền hợp lệ!");
        if (!reason.trim()) return alert("Vui lòng nhập lý do ứng lương!");

        setLoading(true);
        try {
            await advanceService.requestAdvance({ amount: Number(amount), reason });
            alert("Đã gửi yêu cầu ứng lương thành công!");
            
            // Tự động điều hướng sang trang lịch sử ngay sau khi gửi thành công
            router.push('/my-advance-history'); 
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu.");
            setLoading(false); 
        } 
    };

    return (
        <div className="p-6 max-w-3xl mx-auto font-sans">
            <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-wider">Đơn Xin Ứng Lương</h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Số tiền muốn ứng (VNĐ) <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="VD: 2000000"
                            className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-mono"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lý do ứng lương <span className="text-red-500">*</span></label>
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ghi rõ lý do (VD: Khám bệnh, Sửa xe, Có việc gia đình đột xuất...)"
                            className="w-full p-3.5 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !reason.trim()} 
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-colors mt-2 text-base"
                    >
                        {loading ? 'Đang xử lý hệ thống...' : 'Gửi Yêu Cầu Cho Quản Lý'}
                    </button>
                </form>
            </div>
        </div>
    );
}