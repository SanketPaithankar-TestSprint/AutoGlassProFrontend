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

const GlassTypeChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No glass type data available</p>
            </div>
        );
    }

    const barGradientColors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
    ];

    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Count',
                data: data.map(item => item.count),
                backgroundColor: data.map((_, i) => barGradientColors[i % barGradientColors.length]),
                borderColor: '#fff',
                borderWidth: 2,
                borderRadius: 10,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
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
                        return `Count: ${context.parsed.x}`;
                    }
                }
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    stepSize: 1,
                },
                border: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#64748b',
                    font: { size: 12, weight: '500' },
                },
                border: { display: false }
            },
        },
    };

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-4">
                <h3 className="text-base font-bold text-slate-700">Glass Type Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    Total Parts Installed: <span className="font-semibold text-slate-600">{total}</span>
                </p>
            </div>

            <div className="flex-1 min-h-[250px]">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default GlassTypeChart;
