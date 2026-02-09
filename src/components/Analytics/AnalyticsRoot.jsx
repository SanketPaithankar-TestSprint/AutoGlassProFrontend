import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Alert, Select, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import RevenueChart from './RevenueChart';
import IncomeDistribution from './IncomeDistribution';
import StatusDistribution from './StatusDistribution';
import TopKpiStats from './TopKpiStats';
import ServiceLocationChart from './ServiceLocationChart';
import RecentActivityTable from './RecentActivityTable';
import QuoteStatsRow from './QuoteStatsRow';
import JobStatusGauge from './JobStatusGauge';
import JobProductivityRow from './JobProductivityRow';
import { getAnalyticsDashboard } from '../../api/getAnalyticsDashboard';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsRoot = () => {
    // We need the userId. Ideally, this should come from context or a user profile hook.
    // For now, we will rely on the API service fetching the token and the backend handling user identity.
    const userId = sessionStorage.getItem('userId');

    const [filterType, setFilterType] = React.useState('all_time');
    const [customRange, setCustomRange] = React.useState(null);

    // Calculate start and end dates based on filter
    const dateParams = React.useMemo(() => {
        const today = dayjs().format('YYYY-MM-DD');
        let startDate = null;
        let endDate = null;

        switch (filterType) {
            case 'last_week':
                startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
                endDate = today;
                break;
            case 'last_month':
                startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
                endDate = today;
                break;
            case 'custom':
                if (customRange && customRange[0] && customRange[1]) {
                    startDate = customRange[0].format('YYYY-MM-DD');
                    endDate = customRange[1].format('YYYY-MM-DD');
                }
                break;
            case 'all_time':
            default:
                // No date params
                break;
        }
        return { startDate, endDate };
    }, [filterType, customRange]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['analyticsDashboard', userId, dateParams],
        queryFn: async () => {
            if (!userId) {
                throw new Error("User ID not found. Please ensure you are logged in.");
            }
            return getAnalyticsDashboard(userId, dateParams.startDate, dateParams.endDate);
        },
        enabled: !!userId,
    });

    if (!userId) {
        return (
            <div className="p-8 flex justify-center">
                <Alert message="User ID missing. Try refreshing the page or logging in again." type="warning" showIcon />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spin size="large" tip="Loading Dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert
                    message="Error Loading Dashboard"
                    description={error.message || "Failed to fetch analytics data."}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500">Overview of your business performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={filterType}
                        style={{ width: 140 }}
                        onChange={(value) => setFilterType(value)}
                        className="rounded-lg"
                    >
                        <Option value="all_time">All Time</Option>
                        <Option value="last_week">Last Week</Option>
                        <Option value="last_month">Last Month</Option>
                        <Option value="custom">Custom Date</Option>
                    </Select>

                    {filterType === 'custom' && (
                        <RangePicker
                            value={customRange}
                            onChange={(dates) => setCustomRange(dates)}
                            className="rounded-lg"
                        />
                    )}
                </div>
            </header>

            {/* Top KPIs Overview */}
            <TopKpiStats data={data} />

            {/* Financial Metrics Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 px-1">Financial Metrics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[420px]">
                        <RevenueChart data={data?.revenue_trend} />
                    </div>
                    <div className="h-[420px]">
                        <IncomeDistribution data={data?.income_breakdown} />
                    </div>
                </div>
            </div>

            {/* Quote Metrics Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 px-1">Quote Metrics</h2>

                {/* Specific Quote Metrics Row */}
                <QuoteStatsRow quoteAnalysis={data?.quote_analysis} />

                {/* Recent Activity Table */}
                <div className="h-[400px] mt-6">
                    <RecentActivityTable data={data?.recent_activity} />
                </div>
            </div>

            {/* Job Metrics Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 px-1">Job Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px]">
                        <JobStatusGauge data={data?.job_status_distribution} />
                    </div>
                    <div className="h-[400px]">
                        <ServiceLocationChart data={data?.service_location_breakdown} />
                    </div>
                </div>

                {/* Job Productivity KPIs */}
                <JobProductivityRow productivityData={data?.job_productivity_metrics} />
            </div>
        </div>
    );
};

export default AnalyticsRoot;
