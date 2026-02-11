import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ArAgingChart = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No AR aging data available</p>
            </div>
        );
    }

    const chartData = {
        labels: ['0-30 Days', '31-60 Days', '61+ Days'],
        datasets: [
            {
                label: 'Outstanding Balance',
                data: [
                    data['0_30_days'],
                    data['31_60_days'],
                    data['61_plus_days']
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: '#fff',
                borderWidth: 2,
                borderRadius: 10,
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
                        return `Amount: $${context.parsed.y.toLocaleString()}`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    callback: function (value) {
                        return '$' + value.toLocaleString();
                    }
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                },
                border: { display: false }
            },
        },
    };

    const total = data['0_30_days'] + data['31_60_days'] + data['61_plus_days'];

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-4">
                <h3 className="text-base font-bold text-slate-700">Unpaid Invoices by Age</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    Total Outstanding: <span className="font-semibold text-slate-600">${total.toLocaleString()}</span>
                </p>
            </div>

            <div className="flex-1 min-h-[200px]">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default ArAgingChart;
