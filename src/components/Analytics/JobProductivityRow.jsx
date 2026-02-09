import React from 'react';
import { Card } from 'antd';
import { CheckCircleOutlined, BarChartOutlined, CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons';

const JobProductivityRow = ({ productivityData }) => {
    // If productivityData is missing, default to zeros
    const {
        total_jobs_completed,
        jobs_this_week,
        jobs_this_month,
        average_jobs_per_day
    } = productivityData || {};

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <Card bordered={false} className="shadow-sm rounded-xl border border-slate-100 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-slate-500 font-medium text-sm mb-1">{title}</div>
                    <div className="text-2xl font-bold text-slate-800">{value || 0}</div>
                </div>
                <div
                    className="p-3 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: bgColor || `${color}15`, color: color }}
                >
                    {icon}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {/* Total Jobs Completed */}
            <StatCard
                title="Total Completed"
                value={total_jobs_completed}
                icon={<CheckCircleOutlined className="text-xl" />}
                color="#10B981" // Emerald
            />

            {/* Average Jobs Per Day */}
            <StatCard
                title="Avg Jobs / Day"
                value={average_jobs_per_day}
                icon={<BarChartOutlined className="text-xl" />}
                color="#3B82F6" // Royal Blue
            />

            {/* Jobs This Week */}
            <StatCard
                title="Jobs This Week"
                value={jobs_this_week}
                icon={<CalendarOutlined className="text-xl" />}
                color="#7E5CFE" // Primary Purple
            />

            {/* Jobs This Month */}
            <StatCard
                title="Jobs This Month"
                value={jobs_this_month}
                icon={<FieldTimeOutlined className="text-xl" />}
                color="#00A8E4" // Primary Cyan
            />
        </div>
    );
};

export default JobProductivityRow;
