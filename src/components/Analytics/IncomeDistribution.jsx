import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const IncomeDistribution = ({ data }) => {
    if (!data) {
        return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>;
    }

    const chartData = {
        labels: ['Parts', 'Labor', 'Tax'],
        datasets: [
            {
                label: 'Income Distribution',
                data: [data.parts || 0, data.labor || 0, data.tax || 0],
                backgroundColor: [
                    'rgb(59, 130, 246)', // Blue-500
                    'rgb(16, 185, 129)', // Emerald-500
                    'rgb(245, 158, 11)', // Amber-500
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
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        cutout: '70%', // Thinner ring
    };

    const total = (data.parts || 0) + (data.labor || 0) + (data.tax || 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Income Breakdown</h3>
            <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-2xl font-bold text-slate-800">${total.toFixed(2)}</span>
                </div>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

export default IncomeDistribution;
