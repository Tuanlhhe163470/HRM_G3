"use client";
import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Card, Typography, Tag, message } from 'antd';
import { CalculatorOutlined, FileExcelOutlined } from '@ant-design/icons';
import { calculatePayroll, getMonthlyPayroll } from '@/services/Payroll/payrollService';

const { Title, Text } = Typography;

export default function PayrollCalculationPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getMonthlyPayroll(month, year);
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
            await calculatePayroll(month, year);
            message.success("Hệ thống đã hoàn tất tính lương!");
            fetchData();
        } catch (err) {
            message.error("Tính lương thất bại, vui lòng kiểm tra Backend");
        } finally {
            setCalculating(false);
        }
    };

    useEffect(() => { fetchData(); }, [month, year]);

    // Định nghĩa các cột cho Ant Design Table
    const columns = [
        {
            title: 'Nhân viên',
            key: 'employee',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.employeeID}</Text>
                </Space>
            ),
        },
        {
            title: 'Công thực tế',
            dataIndex: 'actualWorkingDays',
            key: 'days',
            render: (days) => `${days}/26 ngày`,
        },
        {
            title: 'Lương OT',
            dataIndex: 'otSalary',
            key: 'ot',
            align: 'right',
            render: (val) => <Text type="success">+{val?.toLocaleString()}đ</Text>,
        },
        {
            title: 'Thực nhận (Net)',
            dataIndex: 'netSalary',
            key: 'net',
            align: 'right',
            render: (val) => <Text strong style={{ color: '#1677ff', fontSize: '16px' }}>{val?.toLocaleString()}đ</Text>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'Pending' ? 'orange' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <Card borderless shadow={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Xử lý Bảng lương</Title>
                        <Text type="secondary">Tính toán thu nhập hàng tháng dựa trên cấu hình UC2</Text>
                    </div>
                    <Space>
                        <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                        <Button 
                            type="primary" 
                            icon={<CalculatorOutlined />} 
                            loading={calculating}
                            onClick={handleCalculate}
                        >
                            Tính lương hệ thống
                        </Button>
                    </Space>
                </div>

                <Space style={{ marginBottom: '20px', background: '#fafafa', padding: '12px', borderRadius: '8px', width: '100%' }}>
                    <Text strong uppercase style={{ fontSize: '12px', color: '#8c8c8c' }}>Kỳ lương:</Text>
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

                <Table 
                    columns={columns} 
                    dataSource={payrolls} 
                    rowKey="employeeID" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}