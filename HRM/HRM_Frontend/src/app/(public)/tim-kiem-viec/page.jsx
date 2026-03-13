"use client";

import { DEFAULT_PAGE_SIZE } from "@/constants/pageSizeOptions";
import axiosClient from "@/lib/axiosClient";
import { docSoVietNam } from "@/lib/stringsUtils";
import jobPostingService from "@/services/Recruitment/jobPostingService";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  FilterOutlined,
  SearchOutlined,
  TagOutlined
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  InputNumber,
  Pagination,
  Row,
  Select,
  Spin
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý bộ lọc
  const [searchText, setSearchText] = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [salaryFilter, setSalaryFilter] = useState({ min: null, max: null });
  const [sortType, setSortType] = useState("newest");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, deptsData] = await Promise.all([
        jobPostingService.getPublished(),
        axiosClient.get("/Departments"),
      ]);
      setJobs(jobsData);
      setDisplayJobs(jobsData);
      setDepartments(deptsData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic lọc dữ liệu tự động
  const applyFilters = useCallback(() => {
    let filtered = [...jobs];

    if (searchText) {
      filtered = filtered.filter((j) =>
        j.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (selectedDepts.length > 0) {
      filtered = filtered.filter((j) => selectedDepts.includes(j.departmentID));
    }

    if (salaryFilter.min) {
      filtered = filtered.filter((j) => (j.salaryMin || 0) >= salaryFilter.min);
    }
    if (salaryFilter.max) {
      filtered = filtered.filter(
        (j) =>
          (j.salaryMax && j.salaryMax <= salaryFilter.max) ||
          (j.salaryMin && j.salaryMin <= salaryFilter.max),
      );
    }

    // Sắp xếp
    if (sortType === "newest") {
      filtered.sort(
        (a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
      );
    } else if (sortType === "salaryMin") {
      filtered.sort((a, b) => (b.salaryMin || 0) - (a.salaryMin || 0));
    } else if (sortType === "salaryMax") {
      filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    }

    setDisplayJobs(filtered);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  }, [jobs, searchText, selectedDepts, salaryFilter, sortType]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Lấy dữ liệu của trang hiện tại (Pagination logic)
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return displayJobs.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, displayJobs]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedDepts([]);
    setSalaryFilter({ min: null, max: null });
  };

  const getSalaryDisplay = (j) => {
    const min = j?.salaryMin;
    const max = j?.salaryMax;
    if (min && max)
      return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
    if (min) return `Từ ${min.toLocaleString()} VNĐ`;
    if (max) return `Đến ${max.toLocaleString()} VNĐ`;
    return "Thỏa thuận";
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb
          className="mb-8"
          items={[
            { title: <Link href="/">Trang chủ</Link> },
            {
              title: (
                <span className="font-bold text-[#00aeef]">
                  Danh sách việc làm
                </span>
              ),
            },
          ]}
        />

        <Row className="mt-8" gutter={[32, 32]}>
          <Col xs={24} lg={6}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <FilterOutlined className="text-[#00aeef]" />
                <h3 className="text-lg font-bold text-gray-800 m-0 uppercase tracking-tight">
                  Bộ lọc
                </h3>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-widest">
                    Từ khóa
                  </p>
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Tên công việc..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-lg h-10 border-gray-200 w-full"
                    allowClear
                  />
                </div>

                <div>
                  <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-widest">
                    Phòng ban
                  </p>
                  <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    <Checkbox.Group
                      className="flex flex-col gap-3"
                      value={selectedDepts}
                      onChange={setSelectedDepts}
                    >
                      {departments.map((dept) => (
                        <Checkbox
                          key={dept.departmentID}
                          value={dept.departmentID}
                        >
                          <span className="text-gray-600 text-sm">
                            {dept.departmentName}
                          </span>
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-widest">
                    Mức lương (VNĐ)
                  </p>
                  <div className="flex flex-col gap-6">
                    <div className="w-full">
                      <InputNumber
                        placeholder="Lương tối thiểu"
                        className="w-full rounded-lg h-10"
                        min={0}
                        value={salaryFilter.min}
                        style={{ width: "100%" }}
                        onChange={(val) =>
                          setSalaryFilter({ ...salaryFilter, min: val })
                        }
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                      {salaryFilter.min > 0 && (
                        <div className="mt-1 text-[10px] text-[#faad14] italic font-medium border-l-2 border-[#faad14] pl-2 leading-tight">
                          {docSoVietNam(salaryFilter.min)}
                        </div>
                      )}
                    </div>

                    <div className="w-full">
                      <InputNumber
                        placeholder="Lương tối đa"
                        className="w-full rounded-lg h-10"
                        min={0}
                        value={salaryFilter.max}
                        style={{ width: "100%" }}
                        onChange={(val) =>
                          setSalaryFilter({ ...salaryFilter, max: val })
                        }
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                      {salaryFilter.max > 0 && (
                        <div className="mt-1 text-[10px] text-[#faad14] italic font-medium border-l-2 border-[#faad14] pl-2 leading-tight">
                          {docSoVietNam(salaryFilter.max)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <Button
                    block
                    onClick={resetFilters}
                    className="h-11 rounded-xl text-gray-400 uppercase text-[10px] font-bold tracking-widest border-dashed"
                  >
                    Làm mới bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={18}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
              <span className="text-gray-400 text-sm font-medium">
                Hiển thị <b className="text-gray-700">{displayJobs.length}</b>{" "}
                công việc
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Sắp xếp:
                </span>
                <Select
                  value={sortType}
                  onChange={setSortType}
                  style={{ width: 180 }}
                >
                  <Select.Option value="newest">Mới nhất</Select.Option>
                  <Select.Option value="salaryMin">
                    Lương tối thiểu
                  </Select.Option>
                  <Select.Option value="salaryMax">Lương tối đa</Select.Option>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20 bg-white rounded-2xl border border-gray-50">
                <Spin size="large" tip="Đang lọc kết quả...">
                  <div className="px-20 py-10" />
                </Spin>
              </div>
            ) : currentTableData.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {currentTableData.map((job) => (
                    <Col xs={24} md={12} xl={8} key={job.jobID}>
                      <Link href={`/chi-tiet-viec/${job.jobID}`}>
                        <Card
                          hoverable
                          className="rounded-2xl border-gray-100 h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                          styles={{
                            body: {
                              padding: "24px",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            },
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-[#00aeef] transition-colors group-hover:bg-[#00aeef] group-hover:text-white">
                              <ClockCircleOutlined />
                            </div>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                              {dayjs(job.createdAt).fromNow()}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-800 group-hover:text-[#00aeef] h-12 overflow-hidden uppercase leading-snug mb-2">
                            {job.title}
                          </h4>
                          <p className="text-[#154398] font-bold text-[10px] uppercase mb-4 tracking-widest">
                            {job.department?.departmentName}
                          </p>
                          <div className="space-y-3 flex-1 border-t border-gray-50 pt-4">
                            <div className="flex items-center text-gray-500 text-xs gap-2 font-medium">
                              <TagOutlined className="text-gray-300" />
                              <span className="text-[#00aeef]">
                                {job.position?.positionName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarCircleOutlined className="text-red-500" />
                              <span className="font-black text-red-600 text-sm tracking-tight">
                                {getSalaryDisplay(job)}
                              </span>
                            </div>
                          </div>
                          <Button
                            block
                            className="mt-6 bg-[#00aeef] border-none text-white font-bold h-11 rounded-xl text-[10px] uppercase tracking-widest shadow-md"
                          >
                            Chi tiết
                          </Button>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>

                <div className="mt-12 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={displayJobs.length}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white py-20 rounded-2xl border border-dashed border-gray-200 text-center">
                <Empty description="Không có công việc phù hợp" />
                <Button type="link" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
