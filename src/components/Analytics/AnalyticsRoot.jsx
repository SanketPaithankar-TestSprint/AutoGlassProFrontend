import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Alert, Select, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import RevenueChart from './RevenueChart';
import IncomeDistribution from './IncomeDistribution';
import StatusDistribution from './StatusDistribution';
import OutstandingBalanceCard from './OutstandingBalanceCard';
import RecentActivityTable from './RecentActivityTable';
import { getAnalyticsDashboard } from '../../api/getAnalyticsDashboard';
import { getValidToken } from '../../api/getValidToken';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsRoot = () => {
    // We need the userId. Ideally, this should come from context or a user profile hook.
    // For now, we will rely on the API service fetching the token and the backend handling user identity,
    // OR we can fetch the profile first if the analytics API strictly requires a userId parameter.
    // Looking at the prompt, the API endpoint is `.../dashboard?user_id=2`.
    // So we need to get the userId.

    // We can try to get it from sessionStorage as seen in getProfile.js: sessionStorage.setItem('userId', profileData.userId);
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
                // If no userId in session, maybe we should fetch profile? 
                // However, for this implementation, let's assume valid session or let the API handle it if userId is missing/null/handled via token
                // If the prompt strictly said pass user_id, we need it. 
                // Let's fallback to "me" or handle it if the API supports it, otherwise throwing error.
                // Re-reading Step 1: "Parameters: user_id (get from your auth context/store)"
                throw new Error("User ID not found. Please ensure you are logged in.");
            }
            return getAnalyticsDashboard(userId, dateParams.startDate, dateParams.endDate);
        },
        enabled: !!userId, // specific dependent query
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
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500">Overview of your business performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        defaultValue="all_time"
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
                            onChange={(dates) => setCustomRange(dates)}
                            className="rounded-lg"
                        />
                    )}
                </div>
            </header>

            {/* Top Stats Row - Expanded for future stats, currently focusing on Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <OutstandingBalanceCard amount={data?.outstanding_balance} />
                {/* Placeholder for future stat cards if needed */}
                <div className="hidden md:block"></div>
                <div className="hidden md:block"></div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Takes up 2 columns on large screens */}
                <div className="lg:col-span-2 h-[400px]">
                    <RevenueChart data={data?.revenue_trend} />
                </div>
                {/* Income Distribution - Takes up 1 column */}
                <div className="h-[400px]">
                    <IncomeDistribution data={data?.income_breakdown} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[350px]">
                    <StatusDistribution data={data?.job_status_distribution} />
                </div>
                <div className="h-[350px]">
                    <RecentActivityTable data={data?.recent_activity} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsRoot;
