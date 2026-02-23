import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CreditCard, Smartphone, Banknote, FileCheck, Wallet } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const PaymentMethodChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No payment method data available</p>
            </div>
        );
    }

    const totalJobs = data.reduce((acc, curr) => acc + curr.count, 0);

    const formatMethodName = (method) => {
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const getIcon = (method) => {
        switch (method) {
            case 'CREDIT_CARD': return <CreditCard className="w-4 h-4 text-blue-600" />;
            case 'ZELLE': return <Smartphone className="w-4 h-4 text-purple-600" />;
            case 'CASH': return <Banknote className="w-4 h-4 text-green-600" />;
            case 'INSURANCE_CHECK': return <FileCheck className="w-4 h-4 text-emerald-600" />;
            default: return <Wallet className="w-4 h-4 text-slate-600" />;
        }
    };

    const getBgColor = (method) => {
        switch (method) {
            case 'CREDIT_CARD': return 'bg-blue-50 text-blue-600';
            case 'ZELLE': return 'bg-purple-50 text-purple-600';
            case 'CASH': return 'bg-green-50 text-green-600';
            case 'INSURANCE_CHECK': return 'bg-emerald-50 text-emerald-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const colors = [
        'rgba(59, 130, 246, 0.85)', // blue
        'rgba(168, 85, 247, 0.85)', // purple
        'rgba(34, 197, 94, 0.85)',  // green
        'rgba(16, 185, 129, 0.85)', // emerald
        'rgba(245, 158, 11, 0.85)', // amber
        'rgba(239, 68, 68, 0.85)',  // red
    ];

    const chartData = {
        labels: data.map(item => formatMethodName(item.method)),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: data.map((_, index) => colors[index % colors.length]),
                borderColor: '#fff',
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 16
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 10,
                titleFont: { size: 12 },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        const value = context.parsed;
                        const percentage = totalJobs > 0 ? ((value / totalJobs) * 100).toFixed(0) : 0;
                        return `${value} jobs (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '72%',
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-5 lg:p-6 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-1 sm:mb-2">Payment Methods</h3>

            <div className="flex items-center justify-center mb-0 sm:mb-2 mt-[-8px]">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Payments</p>
                        <p className="text-base font-bold text-slate-800">{totalJobs}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4 flex-1 overflow-y-auto pr-1">
                {data.map((item, index) => (
                    <div key={item.method} className="flex flex-col gap-1.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgColor(item.method)}`}>
                                {getIcon(item.method)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">{formatMethodName(item.method)}</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between px-1">
                            <p className="text-[10px] font-semibold text-slate-400">${item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className="flex items-baseline gap-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                                <span className="text-xs font-bold text-slate-700">{item.count}</span>
                                <span className="text-[9px] text-slate-400">
                                    {totalJobs > 0 ? ((item.count / totalJobs) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodChart;
