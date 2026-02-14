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
        labels: ['Insurance', 'Cash'],
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
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: function (context) {
                        const value = context.parsed;
                        const percentage = totalJobs > 0 ? ((value / totalJobs) * 100).toFixed(1) : 0;
                        return `${context.label}: ${value} jobs (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '68%',
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-5 lg:p-6 h-full flex flex-col overflow-hidden"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-3 sm:mb-4">Insurance vs Cash</h3>

            <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Jobs</p>
                        <p className="text-base font-bold text-slate-800">{totalJobs}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-slate-500 truncate">Insurance</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 truncate">${insurance_revenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-700">{insurance_jobs}</span>
                        <span className="text-xs text-slate-400 ml-1">
                            ({totalJobs > 0 ? ((insurance_jobs / totalJobs) * 100).toFixed(1) : 0}%)
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-slate-500 truncate">Cash</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 truncate">${cash_revenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-700">{cash_jobs}</span>
                        <span className="text-xs text-slate-400 ml-1">
                            ({totalJobs > 0 ? ((cash_jobs / totalJobs) * 100).toFixed(1) : 0}%)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsuranceBreakdownCard;

