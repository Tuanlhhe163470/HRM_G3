'use client';
import { Table, Button, Modal, message, Space, Tag, Select, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrollService } from '@/services/Payroll/payrollService';
import { exportPayrollToExcel } from '@/utils/payrollExport';

export default function PayrollProcessingPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ĐÃ THÊM: State quản lý Tháng và Năm ---
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2026);

  // State cho Tìm kiếm và Sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Lọc và Sắp xếp danh sách
  const filteredAndSortedData = React.useMemo(() => {
    let result = data.filter(item =>
      (item.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.employeeID?.toString() || '').includes(searchTerm)
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return (a.fullName || '').localeCompare(b.fullName || '');
        case 'name_desc': return (b.fullName || '').localeCompare(a.fullName || '');
        case 'net_desc': return (b.finalNetSalary || 0) - (a.finalNetSalary || 0);
        case 'net_asc': return (a.finalNetSalary || 0) - (b.finalNetSalary || 0);
        case 'default':
        default: return 0;
      }
    });

    return result;
  }, [data, searchTerm, sortBy]);

  // 1. Tải dữ liệu bảng lương (ĐÃ SỬA: Lấy theo state Tháng/Năm)
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getMonthlyPayroll(selectedMonth, selectedYear);
      setData(response.data);
    } catch (err) {
      messageApi.error("Không thể tải bảng lương");
    } finally {
      setLoading(false);
    }
  };

  // ĐÃ SỬA: Tự động load lại dữ liệu mỗi khi selectedMonth hoặc selectedYear thay đổi
  useEffect(() => { 
    fetchPayroll(); 
  }, [selectedMonth, selectedYear]);

  // 2. Điều hướng sang trang thiết lập lương
  const handleSetupSalary = (employeeId) => {
    router.push(`/payroll/employee-salary/${employeeId}`);
  };

  // 3. Điều hướng sang trang Điều chỉnh lương
  const handleReview = (employeeId) => {
    router.push(`/payroll/adjustment?employeeId=${employeeId}`);
  };

  const handleApprove = async (id, isApproved) => {
    try {
      await payrollService.approvePayroll(id, isApproved, 3);
      messageApi.success(isApproved ? "Đã duyệt bảng lương" : "Đã từ chối bảng lương");
      fetchPayroll();
    } catch (err) {
      messageApi.error("Lỗi khi phê duyệt");
    }
  };

  const handleExportExcel = async () => {
    try {
      // Export all payrolls currently shown (filtered and sorted)
      await exportPayrollToExcel(filteredAndSortedData, selectedMonth, selectedYear);
      messageApi.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất excel:", error);
      messageApi.error("Có lỗi xảy ra khi tạo file Excel.");
    }
  };

  const handleResubmit = async (id) => {
    try {
      await payrollService.resubmitPayroll(id);
      messageApi.success("Đã trình duyệt lại bảng lương thành công!");
      fetchPayroll();
    } catch (err) {
      messageApi.error("Lỗi khi trình duyệt lại");
    }
  };

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.roleName);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const columns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <div>
          <div style={{ color: '#1890ff', fontWeight: 'bold' }}>{record.fullName || 'N/A'}</div>
          <small style={{ color: '#999' }}>ID: {record.employeeID}</small>
        </div>
      )
    },
    {
      title: 'Thực nhận (Net)',
      dataIndex: 'finalNetSalary',
      render: (val) => <b style={{ color: '#52c41a' }}>{val?.toLocaleString()}đ</b>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'blue'}>
          {status?.toUpperCase() || 'DRAFT'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleSetupSalary(record.employeeID)}>Cấu hình</Button>

          <Button size="small" type="dashed" onClick={() => handleReview(record.employeeID)}>
            ✎ Điều chỉnh
          </Button>

          {record.status === 'Draft' && (userRole === 'Manager' || userRole === 'Admin') && (
            <>
              <Button size="small" type="primary" onClick={() => handleApprove(record.payrollID, true)}>Duyệt</Button>
              <Button size="small" danger onClick={() => handleApprove(record.payrollID, false)}>Từ chối</Button>
            </>
          )}

          {record.status === 'Rejected' && (userRole === 'HR' || userRole === 'Admin') && (
            <Button size="small" type="primary" onClick={() => handleResubmit(record.payrollID)}>
              Trình duyệt lại
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0 }}>Xử lý & Phê duyệt Lương</h1>
            {/* ĐÃ SỬA: Hiển thị Text động theo tháng/năm đang chọn */}
            <p style={{ color: '#8c8c8c', margin: 0 }}>
              Tháng {selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth}/{selectedYear}
            </p>
          </div>
          <Space>
            <Button onClick={handleExportExcel} style={{ background: '#107c41', color: 'white', borderColor: '#107c41' }}>
              📊 Xuất Excel
            </Button>
            <Button type="primary" onClick={fetchPayroll} loading={loading}>Làm mới dữ liệu</Button>
          </Space>
        </div>

        {/* Toolbar Tìm Kiếm, Sắp Xếp và Chọn Tháng/Năm */}
        <div style={{ marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* --- ĐÃ THÊM: Bộ chọn Tháng/Năm --- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#595959' }}>THỜI GIAN:</span>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 100 }}
              options={[...Array(12)].map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
            />
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 100 }}
              options={[2025, 2026, 2027].map(y => ({ value: y, label: `Năm ${y}` }))}
            />
          </div>

          {/* Dải phân cách dọc */}
          <div style={{ width: '1px', height: '24px', background: '#d9d9d9', margin: '0 8px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#595959' }}>TÌM KIẾM:</span>
            <Input
              placeholder="Tên hoặc mã NV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#595959' }}>SẮP XẾP:</span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 200 }}
              options={[
                { value: 'default', label: 'Tất cả' },
                { value: 'name_asc', label: 'Tên (A-Z)' },
                { value: 'name_desc', label: 'Tên (Z-A)' },
                { value: 'net_desc', label: 'Thực nhận (Cao - Thấp)' },
                { value: 'net_asc', label: 'Thực nhận (Thấp - Cao)' }
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAndSortedData}
          rowKey="payrollID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

      </div>
    </div>
  );
}