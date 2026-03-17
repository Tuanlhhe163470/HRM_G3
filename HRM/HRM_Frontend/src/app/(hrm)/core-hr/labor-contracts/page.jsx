"use client";

import CustomModal from "@/components/Modal/CustomModal";
import axiosClient from "@/lib/axiosClient";
import { docSoVietNam } from "@/lib/stringsUtils";
import laborContractService from "@/services/HRCore/laborContractService";
import {
  AuditOutlined,
  CalendarOutlined,
  DeleteOutlined,
  DollarOutlined,
  EyeOutlined,
  FileProtectOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Text } = Typography;

export default function LaborContractPage() {
  const searchParams = useSearchParams();
  const candidateIdFromUrl = searchParams.get("candidateId");
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const salaryValue = Form.useWatch("baseSalary", form);

  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [employeesNoContract, setEmployeesNoContract] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);

  const disabledPastDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractRes, deptRes, empRes] = await Promise.all([
        laborContractService.getAll({ PageNumber: 1, PageSize: 100 }),
        axiosClient.get("/Departments"),
        laborContractService.getEmployeesWithoutContract(),
      ]);

      const contractList = contractRes.data?.data || contractRes.data || [];
      setContracts(contractList);
      setFilteredContracts(contractList);
      setAllDepartments(deptRes.data || deptRes || []);
      setEmployeesNoContract(empRes.data || empRes || []);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải dữ liệu.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (candidateIdFromUrl) handleAutoPrepare(candidateIdFromUrl);
  }, [candidateIdFromUrl]);

  useEffect(() => {
    const filtered = contracts.filter((c) => {
      const employeeName = c.employee?.name || "";
      const deptName = c.departmentName || "";
      const matchName =
        !searchText ||
        employeeName.toLowerCase().includes(searchText.toLowerCase());
      const matchDept = !filterDept || deptName === filterDept;
      const matchType = filterType === "ALL" || c.contractType === filterType;
      return matchName && matchDept && matchType;
    });
    setFilteredContracts(filtered);
  }, [searchText, filterDept, filterType, contracts]);

  const handleEmployeeChange = async (employeeId) => {
    form.setFieldsValue({
      baseSalary: null,
      contractType: null,
      startDate: null,
      endDate: null,
    });

    const selectedEmp = employeesNoContract.find(
      (e) => e.employeeID === employeeId,
    );
    if (selectedEmp && selectedEmp.candidateID) {
      try {
        setLoading(true);
        const res = await laborContractService.prepareFromOffer(
          selectedEmp.candidateID,
        );
        const data = res.data || res;

        const cleanSalary = data.baseSalary
          ? Math.floor(Number(data.baseSalary))
          : 0;

        form.setFieldsValue({
          contractType: data.contractType,
          baseSalary: cleanSalary,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          endDate: data.endDate ? dayjs(data.endDate) : null,
        });

        notification.success({
          title: "Lương đề xuất đã gửi cho nhân viên",
          description: `Lương cơ bản: ${cleanSalary.toLocaleString()} VNĐ`,
        });
      } catch (error) {
        console.error("Không tìm thấy offer");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAutoPrepare = async (id) => {
    try {
      const res = await laborContractService.prepareFromOffer(id);
      const data = res.data || res;
      setIsModalOpen(true);

      const cleanSalary = data.baseSalary
        ? Math.floor(Number(data.baseSalary))
        : 0;

      setTimeout(() => {
        form.setFieldsValue({
          employeeID: data.employeeID,
          contractType: data.contractType,
          baseSalary: cleanSalary,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          endDate: data.endDate ? dayjs(data.endDate) : null,
          signedDate: dayjs(),
        });
      }, 150);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể lấy dữ liệu Offer.",
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        signedDate: values.signedDate?.format("YYYY-MM-DD"),
      };

      if (isEditMode && selectedContract) {
        await laborContractService.update(selectedContract.contractID, payload);
        notification.success({
          title: "Thành công",
          message: "Cập nhật thành công",
        });
      } else {
        await laborContractService.create(payload);
        notification.success({
          title: "Thành công",
          message: "Tạo hợp đồng thành công",
        });
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: error.response?.data?.message,
      });
    }
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await laborContractService.getById(record.contractID);
      const data = res.data || res;

      setSelectedContract(data);
      setIsDetailModalOpen(true);
    } catch (err) {
      notification.error({
        title: "Lỗi",
        description: "Không thể tải chi tiết hợp đồng",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setSelectedContract(record);
    setIsModalOpen(true);

    setTimeout(() => {
      form.setFieldsValue({
        employeeID: record.employee?.id,
        contractType: record.contractType,
        baseSalary: record.baseSalary,
        startDate: dayjs(record.startDate),
        endDate: record.endDate ? dayjs(record.endDate) : null,
        signedDate: record.signedDate ? dayjs(record.signedDate) : null,
      });
    }, 100);
  };

  const handleDelete = (record) => {
    setContractToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await laborContractService.delete(contractToDelete.contractID);
      notification.success({ title: "Đã vô hiệu hóa hợp đồng" });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      notification.error({ title: "Lỗi", message: "Lỗi khi xóa" });
    }
  };

  const columns = [
    {
      title: "Nhân viên",
      key: "employee",
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            className="bg-blue-100 text-blue-600"
            icon={<UserOutlined />}
          />
          <Text strong>{record.employee?.name}</Text>
        </Space>
      ),
    },
    {
      title: "Phòng ban",
      key: "department",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Tag
          color="blue"
          className="border-none bg-blue-50 text-blue-600 font-medium"
        >
          {record.departmentName}
        </Tag>
      ),
    },
    {
      title: "Loại HĐ",
      dataIndex: "contractType",
      width: 160,
      align: "center",
      render: (type) => (
        <Tag color="cyan" className="font-medium">
          {type}
        </Tag>
      ),
    },
    {
      title: "Lương cơ bản",
      dataIndex: "baseSalary",
      width: 160,
      align: "center",
      render: (val) => (
        <Text strong className="text-blue-600">
          {val?.toLocaleString()} đ
        </Text>
      ),
    },
    {
      title: "Thời hạn",
      key: "duration",
      width: 220,
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col text-[12px]">
          <Text>
            <CalendarOutlined /> Từ:{" "}
            {dayjs(record.startDate).format("DD/MM/YYYY")}
          </Text>
          <Text type="secondary">
            Đến:{" "}
            {record.endDate
              ? dayjs(record.endDate).format("DD/MM/YYYY")
              : "Vô thời hạn"}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      width: 120,
      render: (active) => (
        <Tag
          color={active ? "green" : "red"}
          className="font-bold text-[9px] uppercase rounded-full"
        >
          {active ? "Đang hiệu lực" : "Hết hạn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => {
        const isDisabled = !record.isActive;

        return (
          <Space>
            <Tooltip title="Xem">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            <Tooltip title={isDisabled ? "Hợp đồng đã vô hiệu hóa" : "Sửa"}>
              <Button
                size="small"
                icon={<AuditOutlined />}
                disabled={isDisabled}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>

            <Tooltip title={isDisabled ? "Đã vô hiệu hóa" : "Vô hiệu hóa"}>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={isDisabled}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 text-left">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 text-left">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#154398] p-2 rounded-xl text-white shadow-md">
              <FileProtectOutlined style={{ fontSize: "24px" }} />
            </div>
            <h1 className="text-2xl font-black text-[#154398] uppercase m-0">
              Quản lý Hợp đồng lao động
            </h1>
          </div>

          <Space wrap size="small">
            <Input
              placeholder="Tìm tên nhân viên..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-56 h-10 rounded-xl border-none shadow-sm"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Lọc phòng ban"
              allowClear
              className="w-48 h-10 shadow-sm"
              onChange={(val) => setFilterDept(val)}
              options={allDepartments.map((d) => ({
                label: d.departmentName,
                value: d.departmentName,
              }))}
            />
            <Select
              value={filterType}
              className="w-44 h-10 shadow-sm"
              onChange={(val) => setFilterType(val)}
              suffixIcon={<FilterOutlined />}
              options={[
                { value: "ALL", label: "Tất cả loại HĐ" },
                { label: "Thực tập", value: "Hợp đồng thực tập" },
                { label: "Thử việc", value: "Hợp đồng thử việc" },
                { label: "Nhân viên chính thức", value: "Hợp đồng chính thức" },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-[#154398] h-10 rounded-xl font-bold px-6 shadow-md"
              onClick={() => {
                setIsModalOpen(true);
                setIsEditMode(false);
                form.resetFields();
              }}
            >
              Tạo hợp đồng
            </Button>
          </Space>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-0">
          <Table
            dataSource={filteredContracts}
            columns={columns}
            loading={loading}
            rowKey="contractID"
            pagination={{
              pageSize: 10,
              showTotal: (t) => `Tổng cộng ${t} hợp đồng`,
            }}
          />
        </Card>
      </div>

      <CustomModal
        open={isModalOpen}
        title={
          <span className="text-[#154398] font-black uppercase flex items-center gap-2">
            <AuditOutlined />
            {isEditMode ? "Cập nhật hợp đồng" : "Thiết lập hợp đồng mới"}
          </span>
        }
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        zIndex={2000}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setIsModalOpen(false);
              form.resetFields();
            }}
            className="rounded-lg h-10 px-6"
          >
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            className="bg-[#154398] rounded-lg h-10 px-8 font-bold"
          >
            Lưu và kích hoạt
          </Button>,
        ]}
        width={750}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-4 text-left"
        >
          <div className="bg-blue-50/50 p-4 rounded-2xl mb-6 border border-blue-100/50">
            <Form.Item
              label={
                <span className="font-bold text-[#154398]">
                  Nhân viên ký kết
                </span>
              }
              name="employeeID"
              rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
            >
              <Select
                placeholder="Tìm nhân viên chưa có hợp đồng..."
                showSearch
                optionFilterProp="label"
                className="h-10 text-left"
                onChange={handleEmployeeChange}
                disabled={isEditMode}
                options={
                  isEditMode
                    ? [
                        {
                          label: selectedContract?.employee?.name,
                          value: selectedContract?.employee?.id,
                        },
                      ]
                    : employeesNoContract.map((e) => ({
                        label: `${e.fullName} - ${e.department?.name || "N/A"}`,
                        value: e.employeeID,
                      }))
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-medium">Loại hợp đồng</span>}
            name="contractType"
            initialValue="Hợp đồng thử việc"
          >
            <Select
              className="h-11"
              options={[
                { label: "Thực tập", value: "Hợp đồng thực tập" },
                { label: "Thử việc", value: "Hợp đồng thử việc" },
                { label: "Nhân viên chính thức", value: "Hợp đồng chính thức" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold">Lương cơ bản (VNĐ)</span>}
            name="baseSalary"
            rules={[{ required: true, message: "Vui lòng nhập lương" }]}
            extra={
              salaryValue > 0 && (
                <div className="p-3 bg-blue-50 mt-2 rounded-xl border border-blue-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#154398] rounded-full animate-pulse"></div>
                  <Text italic className="text-[#154398] text-[13px] ">
                    <span className="font-bold">Bằng chữ:</span>{" "}
                    {docSoVietNam(salaryValue)}
                  </Text>
                </div>
              )
            }
          >
            <InputNumber
              min={0}
              controls={false}
              style={{ width: "100%" }}
              className="h-12 text-xl font-bold"
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => value?.replace(/\D/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
              prefix={<DollarOutlined />}
              placeholder="0"
            />
          </Form.Item>

          <Divider orientation="left" className="m-0 mt-2">
            <Text type="secondary" className="text-[11px] uppercase font-bold">
              Thông tin thời hạn
            </Text>
          </Divider>

          <div className="grid grid-cols-3 gap-4 mt-4 text-left">
            <Form.Item label="Ngày ký kết" name="signedDate">
              <DatePicker
                className="w-full h-10 rounded-lg"
                format="DD/MM/YYYY"
                disabledDate={disabledPastDate}
              />
            </Form.Item>
            <Form.Item
              label="Ngày hiệu lực"
              name="startDate"
              rules={[{ required: true }]}
            >
              <DatePicker
                className="w-full h-10 rounded-lg"
                format="DD/MM/YYYY"
                disabledDate={disabledPastDate}
              />
            </Form.Item>
            <Form.Item label="Ngày hết hạn" name="endDate">
              <DatePicker
                className="w-full h-10 rounded-lg"
                format="DD/MM/YYYY"
                disabledDate={disabledPastDate}
                placeholder="Vô thời hạn"
              />
            </Form.Item>
          </div>
        </Form>
      </CustomModal>

      <CustomModal
        open={isDetailModalOpen}
        title="Chi tiết hợp đồng"
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        zIndex={2000}
      >
        {selectedContract && (
          <div className="space-y-3 text-sm">
            <p>
              <b>Nhân viên:</b> {selectedContract.employee?.name}
            </p>
            <p>
              <b>Loại HĐ:</b> {selectedContract.contractType}
            </p>
            <p>
              <b>Lương:</b> {selectedContract.baseSalary?.toLocaleString()} đ
            </p>
            <p>
              <b>Bắt đầu:</b>{" "}
              {dayjs(selectedContract.startDate).format("DD/MM/YYYY")}
            </p>
            <p>
              <b>Kết thúc:</b>{" "}
              {selectedContract.endDate
                ? dayjs(selectedContract.endDate).format("DD/MM/YYYY")
                : "Không thời hạn"}
            </p>
            <p>
              <b>Trạng thái:</b>{" "}
              {selectedContract.isActive ? "Đang hiệu lực" : "Hết hạn"}
            </p>
          </div>
        )}
      </CustomModal>

      <CustomModal
        open={isDeleteModalOpen}
        title={
          <span className="text-red-600 font-bold uppercase">
            Xác nhận vô hiệu hóa
          </span>
        }
        onCancel={() => setIsDeleteModalOpen(false)}
        zIndex={2000}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsDeleteModalOpen(false)}
            className="rounded-lg h-10 px-6"
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            danger
            onClick={confirmDelete}
            className="rounded-lg h-10 px-6 font-bold"
          >
            Vô hiệu hóa
          </Button>,
        ]}
      >
        <div className="text-sm">
          Bạn có chắc muốn vô hiệu hóa hợp đồng của{" "}
          <b>{contractToDelete?.employee?.name}</b>?
        </div>
      </CustomModal>
    </div>
  );
}
