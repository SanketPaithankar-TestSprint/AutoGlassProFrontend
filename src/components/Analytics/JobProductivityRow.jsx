import React from 'react';
import { Card } from 'antd';
import { CheckCircleOutlined, BarChartOutlined, CalendarOutlined, FieldTimeOutlined, DollarOutlined } from '@ant-design/icons';

const JobProductivityRow = ({ productivityData, avgJobValue }) => {
    // If productivityData is missing, default to zeros
    const {
        total_jobs_completed,
        jobs_this_week,
        jobs_this_month,
        average_jobs_per_day
    } = productivityData || {};

    // Defined strictly purple color
    const PURPLE = '#7E5CFE';

    const StatCard = ({ title, value, icon }) => (
        <Card bordered={false} className="shadow-sm rounded-xl border border-slate-100 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-slate-500 font-medium text-sm mb-1">{title}</div>
                    <div className="text-2xl font-bold text-slate-800">{value || 0}</div>
                </div>
                <div
                    className="p-3 rounded-xl flex items-center justify-center bg-purple-50"
                    style={{ color: PURPLE }}
                >
                    {icon}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-6">
            {/* Total Jobs Completed */}
            <StatCard
                title="Total Completed"
                value={total_jobs_completed}
                icon={<CheckCircleOutlined className="text-xl" />}
            />

            {/* Average Jobs Per Day */}
            <StatCard
                title="Avg Jobs / Day"
                value={average_jobs_per_day}
                icon={<BarChartOutlined className="text-xl" />}
            />

            {/* Jobs This Week */}
            <StatCard
                title="Jobs This Week"
                value={jobs_this_week}
                icon={<CalendarOutlined className="text-xl" />}
            />

            {/* Jobs This Month */}
            <StatCard
                title="Jobs This Month"
                value={jobs_this_month}
                icon={<FieldTimeOutlined className="text-xl" />}
            />

            {/* Avg Job Value */}
            <StatCard
                title="Avg Job Value"
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgJobValue || 0)}
                icon={<DollarOutlined className="text-xl" />}
            />
        </div>
    );
};

export default JobProductivityRow;
