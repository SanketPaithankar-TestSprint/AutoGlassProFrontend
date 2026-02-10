import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, ThunderboltOutlined, DollarOutlined, BankOutlined, CheckCircleOutlined, ScanOutlined } from '@ant-design/icons';

const TopKpiStats = ({ data }) => {
    console.log('TopKpiStats received data:', data); // Debug log to check data structure
    // Real Data extraction with fallback
    const adasCount = data?.adas_analytics?.adas_count || 0;
    const conversionRate = data?.quote_analysis?.conversion_rate || 0;
    const quotesCreated = data?.quote_analysis?.quotes_created || 0; // Quotes created from API
    // Calculate total income from income breakdown (same as IncomeDistribution component)
    const totalIncome = (data?.income_breakdown?.parts || 0) + (data?.income_breakdown?.labor || 0) + (data?.income_breakdown?.tax || 0);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const HeroKpiCard = ({ title, value, icon, isCurrency }) => {
        const displayValue = isCurrency ? formatCurrency(value) : value;

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
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 1. Total Income (Profit) */}
            <HeroKpiCard
                title="Total Income"
                value={totalIncome}
                icon={<DollarOutlined />}
                isCurrency={true}
            />

            {/* 2. Quotes Created */}
            <HeroKpiCard
                title="Quotes Created"
                value={quotesCreated}
                icon={<ThunderboltOutlined />}
            />

            {/* 3. Conversion Rate */}
            <HeroKpiCard
                title="Conversion Rate"
                value={conversionRate}
                icon={<CheckCircleOutlined />}
            />

            {/* 4. ADAS Calibrations (New Metric) */}
            <HeroKpiCard
                title="ADAS Calibrations"
                value={adasCount}
                icon={<ScanOutlined />}
            />
        </div>
    );
};

export default TopKpiStats;
