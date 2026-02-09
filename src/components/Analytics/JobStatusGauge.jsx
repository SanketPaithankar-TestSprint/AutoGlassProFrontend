import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const JobStatusGauge = ({ data }) => {
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
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    '#7E5CFE', // Confirmed: Purple (Gauge Fill)
                    '#f1f5f9', // Pending: Empty Track
                ],
                borderWidth: 0,
                circumference: 180, // Half circle for Gauge
                rotation: -90,      // Start from left
                hoverOffset: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false, // Disable tooltip for gauge feel
            },
        },
        cutout: '80%', // Thickness of gauge
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 w-full mb-4">Job Status</h3>

            <div className="relative w-full h-[200px] flex items-end justify-center pb-4">
                <div className="w-[300px] h-[150px] relative">
                    <Doughnut data={chartData} options={options} />

                    {/* Centered Percentage */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
                        <span className="text-5xl font-bold text-slate-800 -mb-2">{percentage}%</span>
                        <span className="text-sm text-slate-400 font-medium mb-6">Confirmed</span>
                    </div>
                </div>
            </div>

            {/* Metrics Legend */}
            <div className="flex w-full justify-center gap-12 mt-auto pt-4 border-t border-slate-50">
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{confirmedCount}</div>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#7E5CFE]"></div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Confirmed</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{pendingCount}</div>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Pending</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobStatusGauge;
