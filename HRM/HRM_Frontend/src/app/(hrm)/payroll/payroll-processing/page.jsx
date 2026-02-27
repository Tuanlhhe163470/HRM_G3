'use client';
import { Table, Button, Modal, InputNumber, Input, message, Space, Tag, Tabs, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrollService } from '@/services/Payroll/payrollService';

export default function PayrollProcessingPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Modal điều chỉnh
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

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

  // 1. Tải dữ liệu bảng lương (Mặc định lấy tháng 2/2026)
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getMonthlyPayroll(2, 2026);
      setData(response.data);
    } catch (err) {
      messageApi.error("Không thể tải bảng lương");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  // 2. Điều hướng sang trang thiết lập lương (Giữ từ file cũ của bạn)
  const handleSetupSalary = (employeeId) => {
    router.push(`/payroll/employee-salary/${employeeId}`);
  };

  // 3. Xử lý Review điều chỉnh (HR)
  const handleAdjust = async () => {
    try {
      await payrollService.adjustPayroll(selectedRecord.payrollID, adjustAmount, adjustReason);
      messageApi.success("Đã cập nhật điều chỉnh thành công");
      setIsAdjustModalOpen(false);
      fetchPayroll();
    } catch (err) {
      messageApi.error("Lỗi khi điều chỉnh lương");
    }
  };

  // 4. Xử lý Phê duyệt (Manager)
  const handleApprove = async (id, isApproved) => {
    try {
      await payrollService.approvePayroll(id, isApproved, 3);
      messageApi.success(isApproved ? "Đã duyệt bảng lương" : "Đã từ chối bảng lương");
      fetchPayroll();
    } catch (err) {
      messageApi.error("Lỗi khi phê duyệt");
    }
  };

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Lấy thông tin user đăng nhập để lấy role
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
          {/* Nút từ file cũ của bạn */}
          <Button size="small" onClick={() => handleSetupSalary(record.employeeID)}>Cấu hình</Button>

          <Button size="small" type="dashed" onClick={() => {
            setSelectedRecord(record);
            setAdjustAmount(record.adjustmentAmount || 0);
            setAdjustReason(record.adjustmentReason || '');
            setIsAdjustModalOpen(true);
          }}>Review</Button>

          {/* CHỈ BẬT HIỂN THỊ NÚT CHO MANAGER, ADMIN VÀ STATUS DRAFT */}
          {record.status === 'Draft' && (userRole === 'Manager' || userRole === 'Admin') && (
            <>
              <Button size="small" type="primary" onClick={() => handleApprove(record.payrollID, true)}>Duyệt</Button>
              <Button size="small" danger onClick={() => handleApprove(record.payrollID, false)}>Từ chối</Button>
            </>
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
            <p style={{ color: '#8c8c8c', margin: 0 }}>Tháng 02/2026</p>
          </div>
          <Button type="primary" onClick={fetchPayroll} loading={loading}>Làm mới dữ liệu</Button>
        </div>

        {/* Toolbar Tìm Kiếm và Sắp Xếp */}
        <div style={{ marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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

        {/* Modal điều chỉnh lương (UC Review) */}
        <Modal
          title="Điều chỉnh lương thủ công (Thưởng/Phạt)"
          open={isAdjustModalOpen}
          onOk={handleAdjust}
          onCancel={() => setIsAdjustModalOpen(false)}
          destroyOnHidden
        >
          <div style={{ marginBottom: 16 }}>
            <p>Nhân viên: <b>{selectedRecord?.fullName}</b></p>
            <label>Số tiền (Dương là Thưởng, Âm là Phạt):</label>
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              value={adjustAmount}
              onChange={setAdjustAmount}
            />
          </div>
          <div>
            <label>Lý do:</label>
            <Input.TextArea
              rows={3}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Nhập lý do điều chỉnh..."
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}