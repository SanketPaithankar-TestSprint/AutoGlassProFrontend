import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const JobStatusChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No job status data available</p>
            </div>
        );
    }

    const documentTypeNames = {
        0: 'Invoice',
        1: 'Work Order',
        2: 'Quote',
    };

    const statusColors = [
        'rgba(99, 102, 241, 0.85)',
        'rgba(16, 185, 129, 0.85)',
        'rgba(245, 158, 11, 0.85)',
        'rgba(139, 92, 246, 0.85)',
        'rgba(239, 68, 68, 0.85)',
        'rgba(236, 72, 153, 0.85)',
        'rgba(20, 184, 166, 0.85)',
    ];

    const total = data.reduce((sum, item) => sum + item.count, 0);

    const chartData = {
        labels: data.map(item => documentTypeNames[item.document_type] || `Type ${item.document_type}`),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: data.map((_, index) => statusColors[index % statusColors.length]),
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
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '68%',
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-base font-bold text-slate-700 mb-3">Job Status Distribution</h3>

            <div className="flex items-center justify-center mb-3">
                <div className="relative w-36 h-36">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</p>
                        <p className="text-base font-bold text-slate-800">{total}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: statusColors[index % statusColors.length] }}
                            ></div>
                            <span className="text-sm text-slate-500">
                                {documentTypeNames[item.document_type] || `Type ${item.document_type}`}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-semibold text-slate-700">{item.count}</span>
                            <span className="text-xs text-slate-400 ml-1">
                                ({((item.count / total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobStatusChart;
