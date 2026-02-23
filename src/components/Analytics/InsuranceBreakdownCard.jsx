import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FileText, CreditCard } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const InsuranceBreakdownCard = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No insurance data available</p>
            </div>
        );
    }

    const { insurance_jobs, cash_jobs, insurance_revenue, cash_revenue } = data;
    const totalJobs = insurance_jobs + cash_jobs;

    const chartData = {
        labels: ['Insurance', 'Direct Payment'],
        datasets: [
            {
                data: [insurance_jobs, cash_jobs],
                backgroundColor: [
                    'rgba(139, 92, 246, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                ],
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
            <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-1 sm:mb-2">Insurance vs Direct Payment</h3>

            <div className="flex items-center justify-center mb-0 sm:mb-2 mt-[-8px]">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Jobs</p>
                        <p className="text-base font-bold text-slate-800">{totalJobs}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4 flex-1 pr-1">
                <div className="flex flex-col gap-1.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">Insurance</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between px-1">
                        <p className="text-[10px] font-semibold text-slate-400">${insurance_revenue.toLocaleString()}</p>
                        <div className="flex items-baseline gap-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{insurance_jobs}</span>
                            <span className="text-[9px] text-slate-400">
                                {totalJobs > 0 ? ((insurance_jobs / totalJobs) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">Direct Payment</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between px-1">
                        <p className="text-[10px] font-semibold text-slate-400">${cash_revenue.toLocaleString()}</p>
                        <div className="flex items-baseline gap-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{cash_jobs}</span>
                            <span className="text-[9px] text-slate-400">
                                {totalJobs > 0 ? ((cash_jobs / totalJobs) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsuranceBreakdownCard;

