import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Select, DatePicker, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import Loader from '../Loader';
import dayjs from 'dayjs';
import { getAnalyticsDashboard } from '../../api/getAnalyticsDashboard';
import AnalyticsDatePicker from './AnalyticsDatePicker';

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
    const [dateParams, setDateParams] = React.useState({ startDate: null, endDate: null });
    const [activeLabel, setActiveLabel] = React.useState('All time');

    const handleDateChange = ({ startDate, endDate, label }) => {
        setDateParams({ startDate, endDate });
        if (label) setActiveLabel(label);
    };

    React.useEffect(() => {
        const id = sessionStorage.getItem('userId');
        setUserId(id);
        setCheckingUserId(false);
    }, []);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['analyticsDashboard', userId, dateParams.startDate ?? 'all', dateParams.endDate ?? 'all'],
        queryFn: async () => {
            if (!userId) {
                throw new Error("User ID not found. Please ensure you are logged in.");
            }
            return getAnalyticsDashboard(userId, dateParams.startDate, dateParams.endDate);
        },
        enabled: !!userId,
        placeholderData: (prev) => prev,  // v5: keep old data visible during refetch
    });


    // Only show full-screen spinner on the very first load (no data yet)
    if (checkingUserId || !userId || (isLoading && !data)) {
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
                    <div className="flex items-center gap-2">
                        <h1 className="!text-[30px] font-extrabold text-slate-800 m-0">
                            Shop Analytics
                        </h1>
                        <Tooltip title="Comprehensive business analytics and insights" placement="right">
                            <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                        </Tooltip>
                    </div>

                    <AnalyticsDatePicker onChange={handleDateChange} activeLabel={activeLabel} />
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
