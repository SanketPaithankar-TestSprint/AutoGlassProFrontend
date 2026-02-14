import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RevenueTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No revenue data available</p>
            </div>
        );
    }

    const dates = data.map(item => dayjs(item.date));

    const chartData = {
        labels: dates.map(d => d.format('YYYY-MM-DD')),
        datasets: [
            {
                label: 'Daily Revenue',
                data: data.map(item => item.total),
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
                    return gradient;
                },
                borderColor: 'rgb(99, 102, 241)',
                tension: 0.4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(99, 102, 241)',
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2.5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 5,
                right: 10,
                top: 10,
                bottom: 20
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 14,
                cornerRadius: 10,
                titleColor: '#e2e8f0',
                bodyColor: '#fff',
                titleFont: { size: 12 },
                bodyFont: { size: 13, weight: 'bold' },
                callbacks: {
                    title: function (tooltipItems) {
                        const dateStr = tooltipItems[0].label;
                        return dayjs(dateStr).format('MMM DD, YYYY');
                    },
                    label: function (context) {
                        return `  Revenue: $${context.parsed.y.toLocaleString()}`;
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
                    font: { size: 10 },
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: true,
                    autoSkipPadding: 10,
                    maxTicksLimit: 15,
                    callback: function (value, index) {
                        const dateStr = this.getLabelForValue(value);
                        const d = dayjs(dateStr);
                        // Show month name on first day of month
                        if (d.date() === 1) {
                            return d.format('MMM');
                        }
                        // Show day number for other days
                        return d.format('D');
                    }
                },
                border: { display: false }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-5 lg:p-6 h-full flex flex-col overflow-hidden"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-700">Revenue Trend</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Daily cash collection overview</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg self-start sm:self-auto">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-medium text-indigo-600">Revenue</span>
                </div>
            </div>
            <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default RevenueTrendChart;

