import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const IncomeBreakdownCard = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No income data available</p>
            </div>
        );
    }

    const { parts, labor, tax } = data;
    const total = parts + labor + tax;

    const chartData = {
        labels: ['Parts', 'Labor', 'Tax'],
        datasets: [
            {
                data: [parts, labor, tax],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                ],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: function (context) {
                        const value = context.parsed;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '72%',
    };

    const breakdown = [
        { label: 'Parts', value: parts, color: 'bg-indigo-500' },
        { label: 'Labor', value: labor, color: 'bg-emerald-500' },
        { label: 'Tax', value: tax, color: 'bg-amber-500' },
    ];

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-base font-bold text-slate-700 mb-2">Income Breakdown</h3>

            <div className="flex-1 flex items-center justify-center">
                <div className="relative w-36 h-36">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</p>
                        <p className="text-base font-bold text-slate-800">${total.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="mt-2 space-y-1.5">
                {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-slate-500">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                            ${item.value.toLocaleString()} <span className="text-xs font-normal text-slate-400">({((item.value / total) * 100).toFixed(1)}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncomeBreakdownCard;
