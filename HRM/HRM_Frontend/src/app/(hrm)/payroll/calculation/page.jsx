"use client";
import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Card, Typography, Tag, message } from 'antd';
import { CalculatorOutlined, FileExcelOutlined } from '@ant-design/icons';
import { payrollService } from '@/services/Payroll/payrollService';
import { exportPayrollToExcel } from '@/utils/payrollExport';

const { Title, Text } = Typography;

export default function PayrollCalculationPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [exporting, setExporting] = useState(false);

    // --- STATE TÌM KIẾM & SẮP XẾP ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const filteredAndSortedPayrolls = React.useMemo(() => {
        let result = payrolls.filter(p =>
            (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.employeeID?.toString() || '').includes(searchTerm)
        );

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc': return (a.fullName || '').localeCompare(b.fullName || '');
                case 'name_desc': return (b.fullName || '').localeCompare(a.fullName || '');
                case 'net_desc': return (b.finalNetSalary || 0) - (a.finalNetSalary || 0);
                case 'net_asc': return (a.finalNetSalary || 0) - (b.finalNetSalary || 0);
                case 'default':
                default: return 0; // Giữ nguyên thứ tự ban đầu
            }
        });

        return result;
    }, [payrolls, searchTerm, sortBy]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await payrollService.getMonthlyPayroll(month, year);
            setPayrolls(res.data);
        } catch (err) {
            message.error("Lỗi tải dữ liệu bảng lương");
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            await payrollService.calculatePayroll(month, year);
            message.success("Hệ thống đã hoàn tất tính lương!");
            fetchData();
        } catch (err) {
            console.error("Lỗi khi tính lương:", err);
            if (err.response && err.response.data && err.response.data.message) {
                message.error(err.response.data.message);
            } else {
                message.error("Tính lương thất bại, vui lòng kiểm tra Backend");
            }
        } finally {
            setCalculating(false);
        }
    };

    const handleExportExcel = async () => {
        if (!payrolls || payrolls.length === 0) {
            message.warning('Không có dữ liệu để xuất. Vui lòng tính lương trước!');
            return;
        }
        setExporting(true);
        try {
            await exportPayrollToExcel(payrolls, month, year);
            message.success(`Đã xuất Excel bảng lương tháng ${month}/${year} thành công!`);
        } catch (err) {
            console.error(err);
            message.error('Xuất Excel thất bại!');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => { fetchData(); }, [month, year]);

    // Định nghĩa các cột khớp với MonthlyPayroll.cs và MonthlyTimesheet.cs
    const columns = [
        {
            title: 'Nhân viên',
            key: 'employee',
            fixed: 'left',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {/* Hiển thị FullName từ object được trả về */}
                    <Text strong>{record.fullName || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.employeeID}</Text>
                </Space>
            ),
        },
        {
            title: 'Công thực tế',
            key: 'days',
            align: 'center',
            render: (_, record) => (
                <Text>{record.actualWorkDays}/{record.standardWorkDays} ngày</Text>
            ),
        },
        {
            title: 'Lương cơ bản',
            dataIndex: 'baseSalary',
            key: 'baseSalary',
            align: 'right',
            render: (val) => `${val?.toLocaleString()}đ`,
        },
        {
            title: 'Phụ cấp',
            dataIndex: 'totalAllowance',
            key: 'allowance',
            align: 'right',
            render: (val) => <Text type="success">+{val?.toLocaleString()}đ</Text>,
        },
        {
            title: 'Khấu trừ',
            dataIndex: 'totalDeduction',
            key: 'deduction',
            align: 'right',
            render: (val) => <Text type="danger">-{val?.toLocaleString()}đ</Text>,
        },
        {
            title: 'Thực nhận (Net)',
            dataIndex: 'finalNetSalary', // Sửa từ netSalary thành finalNetSalary cho đúng Entity
            key: 'net',
            align: 'right',
            render: (val) => (
                <Text strong style={{ color: '#1677ff', fontSize: '15px' }}>
                    {val?.toLocaleString()}đ
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'Draft' ? 'orange' : 'green'}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <Card borderless shadow={false} style={{ borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Xử lý Bảng lương</Title>
                        <Text type="secondary">Quản lý và tính toán thu nhập dựa trên dữ liệu công thực tế</Text>
                    </div>
                    <Space>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleExportExcel}
                            loading={exporting}
                            style={{ borderColor: '#16a34a', color: '#16a34a' }}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<CalculatorOutlined />}
                            loading={calculating}
                            onClick={handleCalculate}
                            size="large"
                        >
                            Tính lương hệ thống
                        </Button>
                    </Space>
                </div>

                <Space style={{ marginBottom: '20px', background: '#fafafa', padding: '12px', borderRadius: '8px', width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Space>
                        <Text strong uppercase style={{ fontSize: '11px', color: '#8c8c8c' }}>Kỳ lương:</Text>
                        <Select
                            value={month}
                            onChange={setMonth}
                            style={{ width: 120 }}
                            options={[...Array(12)].map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
                        />
                        <Select
                            value={year}
                            onChange={setYear}
                            style={{ width: 120 }}
                            options={[{ value: 2026, label: 'Năm 2026' }, { value: 2025, label: 'Năm 2025' }]}
                        />
                    </Space>

                    <Space>
                        <Text strong uppercase style={{ fontSize: '11px', color: '#8c8c8c' }}>Tìm kiếm:</Text>
                        <input
                            type="text"
                            placeholder="Tên nhân viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:border-blue-500"
                        />

                        <Text strong uppercase style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: 8 }}>Sắp xếp:</Text>
                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ width: 160 }}
                            options={[
                                { value: 'default', label: 'Tất cả' },
                                { value: 'name_asc', label: 'Tên (A-Z)' },
                                { value: 'name_desc', label: 'Tên (Z-A)' },
                                { value: 'net_desc', label: 'Thực nhận (Cao - Thấp)' },
                                { value: 'net_asc', label: 'Thực nhận (Thấp - Cao)' }
                            ]}
                        />
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredAndSortedPayrolls}
                    rowKey="payrollID" // Sửa rowKey thành payrollID khớp với Entity MonthlyPayroll.cs
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ x: 800 }} // Hỗ trợ hiển thị tốt trên màn hình nhỏ
                />
            </Card>
        </div>
    );
}