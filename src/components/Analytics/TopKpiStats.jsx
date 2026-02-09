import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, ThunderboltOutlined, DollarOutlined, BankOutlined, CheckCircleOutlined, ScanOutlined } from '@ant-design/icons';

const TopKpiStats = ({ data }) => {
    // Real Data extraction with fallback
    const adasCount = data?.quote_analysis?.adas_count || 1; // Default to 1 as per user prompt example
    const conversionRate = data?.quote_analysis?.conversion_rate || 0;

    // Dummy Data
    const dummyTraffic = 854;
    const dummyProfit = 12450;

    // Growth Data (Dummy)
    const incomeGrowth = 15.3;
    const trafficGrowth = 8.2;
    const conversionGrowth = -1.5;
    const adasGrowth = 12.0;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const HeroKpiCard = ({ title, value, icon, growth, growthLabel, isCurrency }) => {
        const displayValue = isCurrency ? formatCurrency(value) : value;
        const isPositive = growth >= 0;
        const GrowthIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;

        return (
            <div className="bg-[#7E5CFE] p-8 rounded-2xl shadow-lg flex flex-col justify-between h-64 relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-xl">
                {/* Background Decorative Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                    {React.cloneElement(icon, { style: { fontSize: '180px', color: '#fff' } })}
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-purple-100 text-lg font-medium tracking-wide">{title}</span>
                    </div>
                    <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                        {displayValue}{!isCurrency && typeof value === 'number' && title.includes('Rate') ? '%' : ''}
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5">
                        <span className={`text-sm font-bold flex items-center bg-white/20 text-white rounded px-1`}>
                            <GrowthIcon className="mr-1" /> {Math.abs(growth)}%
                        </span>
                        <span className="text-purple-100 text-sm font-light">{growthLabel || 'vs last month'}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 1. Total Income (Profit) */}
            <HeroKpiCard
                title="Total Income"
                value={dummyProfit}
                icon={<DollarOutlined />}
                growth={incomeGrowth}
                isCurrency={true}
            />

            {/* 2. Enquiry Form Traffic */}
            <HeroKpiCard
                title="Enquiry Traffic"
                value={dummyTraffic}
                icon={<EyeOutlined />}
                growth={trafficGrowth}
                growthLabel="vs last week"
            />

            {/* 3. Conversion Rate */}
            <HeroKpiCard
                title="Conversion Rate"
                value={conversionRate > 0 ? conversionRate : 24.8}
                icon={<CheckCircleOutlined />}
                growth={conversionGrowth}
            />

            {/* 4. ADAS Calibrations (New Metric) */}
            <HeroKpiCard
                title="ADAS Calibrations"
                value={adasCount}
                icon={<ScanOutlined />}
                growth={adasGrowth}
            />
        </div>
    );
};

export default TopKpiStats;
