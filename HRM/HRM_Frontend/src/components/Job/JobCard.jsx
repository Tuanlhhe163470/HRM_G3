import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Tag } from "antd";

export default function JobCard({ job }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300 group">
      <h4 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#00aeef] transition-colors">
        {job.title}
      </h4>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-500 text-sm">
          <BankOutlined className="mr-2 text-gray-400" />
          <span className="truncate">{job.company}</span>
        </div>

        <div className="flex items-center text-gray-500 text-sm">
          <EnvironmentOutlined className="mr-2 text-gray-400" />
          <span>{job.location}</span>
        </div>

        <div className="flex items-center text-gray-500 text-sm">
          <ClockCircleOutlined className="mr-2 text-gray-400" />
          <Tag
            color="blue"
            className="border-none bg-blue-50 text-[#00aeef] m-0 px-2 py-0 text-xs font-medium"
          >
            {job.type}
          </Tag>
        </div>

        <div className="flex items-center text-gray-400 text-xs pt-2 border-t border-gray-50">
          <CalendarOutlined className="mr-2" />
          <span>Đăng ngày: {job.posted}</span>
        </div>
      </div>

      <Button
        block
        className="h-10 rounded border-gray-200 text-gray-600 font-medium hover:border-[#00aeef] hover:text-[#00aeef] flex items-center justify-center group/btn"
      >
        Xem chi tiết
        <ArrowRightOutlined className="ml-2 text-xs group-hover/btn:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
