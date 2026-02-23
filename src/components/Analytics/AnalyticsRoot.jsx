import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Select, DatePicker } from 'antd';
import Loader from '../Loader';
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
import PaymentMethodChart from './PaymentMethodChart';

const { RangePicker } = DatePicker;
const { Option } = Select;


const AnalyticsRoot = () => {
    const [userId, setUserId] = React.useState(null);
    const [checkingUserId, setCheckingUserId] = React.useState(true);
    const [filterType, setFilterType] = React.useState('all_time');
    const [customRange, setCustomRange] = React.useState(null);

    React.useEffect(() => {
        // Simulate async userId retrieval (extend here if needed)
        const id = sessionStorage.getItem('userId');
        setUserId(id);
        setCheckingUserId(false);
    }, []);

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


    // Show a single loading spinner for all loading states
    if (checkingUserId || !userId || isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-100">
                <Loader tip="Loading Dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-slate-100">
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
        <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="!text-[30px] font-extrabold text-slate-800">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Comprehensive business analytics and insights</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Select
                            value={filterType}
                            style={{ width: '100%', minWidth: 150 }}
                            onChange={(value) => setFilterType(value)}
                            className="rounded-lg w-full sm:w-auto"
                            getPopupContainer={(trigger) => trigger.parentElement}
                        >
                            <Option value="all_time">All Time</Option>
                            <Option value="last_week">Last Week</Option>
                            <Option value="last_month">Last Month</Option>
                            <Option value="last_3_months">Last 3 Months</Option>
                            <Option value="custom">Custom Date</Option>
                        </Select>

                        {filterType === 'custom' && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <DatePicker
                                    placeholder="Start Date"
                                    value={customRange?.[0]}
                                    onChange={(date) => setCustomRange([date, customRange?.[1]])}
                                    className="rounded-lg w-full sm:w-auto"
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    format="MMM DD, YYYY"
                                />
                                <DatePicker
                                    placeholder="End Date"
                                    value={customRange?.[1]}
                                    onChange={(date) => setCustomRange([customRange?.[0], date])}
                                    className="rounded-lg w-full sm:w-auto"
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    format="MMM DD, YYYY"
                                />
                            </div>
                        )}
                    </div>
                </header>

                {/* KPI Overview */}
                <KpiGrid data={data} />

                {/* Financial Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-700">Financial Overview</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 h-[300px] sm:h-[350px] lg:h-[400px]">
                            <RevenueTrendChart data={data?.revenue_trend} />
                        </div>
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <IncomeBreakdownCard data={data?.income_breakdown} />
                        </div>
                    </div>
                </section>

                {/* Job Analysis Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-700">Job Analysis</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <QuoteConversionCard data={data?.quote_analysis} />
                        </div>
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <JobStatusChart data={data?.job_status_distribution} />
                        </div>
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <ServiceLocationCard data={data?.service_location_breakdown} />
                        </div>
                    </div>
                </section>

                {/* Operational Insights */}
                <section>
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-700">Operational Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <InsuranceBreakdownCard data={data?.insurance_breakdown} />
                        </div>
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <PaymentMethodChart data={data?.payment_method_breakdown} />
                        </div>
                        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                            <ArAgingChart data={data?.ar_aging} />
                        </div>
                    </div>
                </section>

                {/* Product Analysis */}
                <section>
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-700">Product Analysis</h2>
                    </div>
                    <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
                        <GlassTypeChart data={data?.glass_type_breakdown} />
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <div className="h-[400px] sm:h-[450px] lg:h-[500px]">
                        <RecentActivityTable data={data?.recent_activity} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnalyticsRoot;
