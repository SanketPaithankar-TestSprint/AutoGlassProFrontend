import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Alert, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { getAnalyticsDashboard } from '../../api/getAnalyticsDashboard';

// Import new components
import KpiGrid from './KpiGrid';
import RevenueTrendChart from './RevenueTrendChart';
import IncomeBreakdownCard from './IncomeBreakdownCard';
import JobStatusChart from './JobStatusChart';
import ServiceLocationCard from './ServiceLocationCard';
import InsuranceBreakdownCard from './InsuranceBreakdownCard';
import ArAgingChart from './ArAgingChart';
import GlassTypeChart from './GlassTypeChart';
import QuoteConversionCard from './QuoteConversionCard';
import RecentActivityTable from './RecentActivityTable';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsRoot = () => {
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
            case 'last_3_months':
                startDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
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
            <div className="h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
                <Spin size="large" tip="Loading Dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
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
        <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 via-blue-800 to-violet-800 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">Comprehensive business analytics and insights</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={filterType}
                            style={{ width: 150 }}
                            onChange={(value) => setFilterType(value)}
                            className="rounded-lg"
                        >
                            <Option value="all_time">All Time</Option>
                            <Option value="last_week">Last Week</Option>
                            <Option value="last_month">Last Month</Option>
                            <Option value="last_3_months">Last 3 Months</Option>
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

                {/* KPI Overview */}
                <KpiGrid data={data} />

                {/* Financial Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-700">Financial Overview</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-[400px]">
                            <RevenueTrendChart data={data?.revenue_trend} />
                        </div>
                        <div className="h-[400px]">
                            <IncomeBreakdownCard data={data?.income_breakdown} />
                        </div>
                    </div>
                </section>

                {/* Job Analysis Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-700">Job Analysis</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-[400px]">
                            <QuoteConversionCard data={data?.quote_analysis} />
                        </div>
                        <div className="h-[400px]">
                            <JobStatusChart data={data?.job_status_distribution} />
                        </div>
                        <div className="h-[400px]">
                            <ServiceLocationCard data={data?.service_location_breakdown} />
                        </div>
                    </div>
                </section>

                {/* Operational Insights */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-700">Operational Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[400px]">
                            <InsuranceBreakdownCard data={data?.insurance_breakdown} />
                        </div>
                        <div className="h-[400px]">
                            <ArAgingChart data={data?.ar_aging} />
                        </div>
                    </div>
                </section>

                {/* Product Analysis */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-700">Product Analysis</h2>
                    </div>
                    <div className="h-[400px]">
                        <GlassTypeChart data={data?.glass_type_breakdown} />
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <div className="h-[500px]">
                        <RecentActivityTable data={data?.recent_activity} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnalyticsRoot;
