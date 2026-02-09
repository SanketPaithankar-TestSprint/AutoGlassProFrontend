import React from 'react';
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FinancialStatsRow = ({ data }) => {
    if (!data) return null;

    const {
        total_revenue,
        this_month_revenue,
        last_month_revenue,
        month_over_month_change,
        total_paid,
        total_unpaid,
        tax_collected
    } = data;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    // 1. Specialized Revenue Card with Donut Chart
    const RevenueCard = ({ title, value, paid, unpaid }) => {
        const chartData = {
            labels: ['Paid', 'Unpaid'],
            datasets: [
                {
                    data: [paid, unpaid],
                    backgroundColor: ['#7E5CFE', '#E2E8F0'], // Purple (Paid), Slate-200 (Unpaid)
                    borderWidth: 0,
                    hoverOffset: 2,
                },
            ],
        };

        const options = {
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
            },
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
        };

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center h-full relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7E5CFE]"></div>
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-slate-500 text-sm font-medium mb-1 block">{title}</span>
                        <span className="text-3xl font-bold text-slate-800 block mb-2">{formatCurrency(value)}</span>

                        {/* Legend */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-[#7E5CFE] mr-1.5"></span>
                                <span>Paid: {formatCurrency(paid)}</span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-slate-200 mr-1.5"></span>
                                <span>Unpaid: {formatCurrency(unpaid)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Small Donut Chart */}
                    <div className="w-20 h-20 relative flex-shrink-0 mt-1">
                        <Doughnut data={chartData} options={options} />
                    </div>
                </div>
            </div>
        );
    };

    // 2. Growth Card (Revenue This Month)
    const GrowthCard = ({ title, value, percentage }) => {
        const isPositive = percentage >= 0;
        const colorClass = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
        // Note: Keeping Trend arrows colored for semantic meaning as standard UX, 
        // but can be changed to purple if strictly required. Keeping standard for now.
        const icon = isPositive ? <ArrowUpOutlined className="text-xs mr-1" /> : <ArrowDownOutlined className="text-xs mr-1" />;

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center h-full relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7E5CFE]"></div>
                <span className="text-slate-500 text-sm font-medium mb-1">{title}</span>
                <span className="text-3xl font-bold text-slate-800 mb-3">{formatCurrency(value)}</span>
                <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                        {icon} {Math.abs(percentage)}%
                    </span>
                    <span className="text-slate-400 text-xs ml-2">Compared to last month</span>
                </div>
            </div>
        );
    };

    // 3. Simple Card (Tax)
    const SimpleCard = ({ title, value, highlightColor }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center h-full relative overflow-hidden">
            {highlightColor && <div className={`absolute left-0 top-0 bottom-0 w-1 ${highlightColor}`}></div>}
            <span className="text-slate-500 text-sm font-medium mb-1">{title}</span>
            <span className="text-2xl font-bold text-slate-800">{formatCurrency(value)}</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* 1. Total Revenue with Donut */}
            <RevenueCard
                title="Total Revenue"
                value={total_revenue}
                paid={total_paid || 0}
                unpaid={total_unpaid || 0}
            />

            {/* 2. Revenue This Month (Growth Card) */}
            <GrowthCard
                title="Revenue This Month"
                value={this_month_revenue}
                percentage={month_over_month_change || 0}
            />

            {/* 3. Tax Collected */}
            <SimpleCard
                title="Tax Collected"
                value={tax_collected}
                highlightColor="bg-[#7E5CFE]"
            />

            {/* 4. Payment Status (Outstanding) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center h-full relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7E5CFE]"></div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-slate-500 text-sm font-medium block">Outstanding</span>
                        <span className="text-2xl font-bold text-slate-800">{formatCurrency(total_unpaid)}</span>
                    </div>
                </div>
                <div className="pt-2 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Collected</span>
                        <span className="font-semibold text-[#7E5CFE]">{formatCurrency(total_paid)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialStatsRow;
