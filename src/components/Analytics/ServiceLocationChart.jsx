import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ServiceLocationChart = ({ data }) => {
    if (!data) return null;

    const { in_shop_count, mobile_count } = data;

    // Check if we have data to show
    const total = in_shop_count + mobile_count;
    if (total === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 w-full">Jobs by Location</h3>
                <div className="text-slate-400">No location data available</div>
            </div>
        );
    }

    const chartData = {
        labels: ['In-Shop', 'Mobile'],
        datasets: [
            {
                data: [in_shop_count, mobile_count],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // blue-500
                    'rgba(16, 185, 129, 0.8)', // emerald-500
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '65%',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Jobs by Location</h3>
            <div className="flex-1 relative min-h-[250px]">
                <Doughnut data={chartData} options={options} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">{total}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total Jobs</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceLocationChart;
