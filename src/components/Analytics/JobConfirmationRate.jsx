import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const JobConfirmationRate = ({ data }) => {
    if (!data) return null;

    // Find counts for Pending (2) and Confirmed (3)
    const pendingItem = data.find(d => Number(d.status) === 2);
    const confirmedItem = data.find(d => Number(d.status) === 3);

    const pendingCount = pendingItem ? pendingItem.count : 0;
    const confirmedCount = confirmedItem ? confirmedItem.count : 0;
    const total = pendingCount + confirmedCount;

    const percentage = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;

    const chartData = {
        labels: ['Confirmed', 'Pending'],
        datasets: [
            {
                data: [confirmedCount, pendingCount],
                backgroundColor: [
                    '#7E5CFE', // Confirmed: Purple
                    '#f1f5f9', // Pending: "White" (Very Light Slate)
                ],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hiding default legend to show custom one
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        return ` ${context.label}: ${context.raw}`;
                    }
                }
            },
        },
        cutout: '90%', // Very thin donut
        rotation: 0,
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center relative">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 absolute top-6 left-6">Confirmation Rate</h3>

            <div className="relative w-48 h-48 mt-8">
                <Doughnut data={chartData} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-slate-800">{percentage}%</span>
                    <span className="text-xs text-slate-400 uppercase mt-1">Confirmed</span>
                </div>
            </div>

            <div className="flex gap-8 mt-8">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-800">{confirmedCount}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#7E5CFE]"></div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Confirmed</span>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-800">{pendingCount}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Pending</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobConfirmationRate;
