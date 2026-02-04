import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const RevenueChart = ({ data }) => {
    const [viewType, setViewType] = React.useState('daily');

    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">No revenue data available</div>;
    }

    // Process data based on viewType
    const processedData = React.useMemo(() => {
        if (viewType === 'daily') {
            return {
                labels: data.map(item => dayjs(item.date).format('MM/DD/YYYY')),
                values: data.map(item => item.total)
            };
        } else {
            // Group by Month
            const grouped = {};
            data.forEach(item => {
                const monthKey = dayjs(item.date).format('MMM YYYY');
                // Use a sortable key ensures correct order if spanning years, but map iteration order implies sorting if input is sorted
                // Better approach: use YYYY-MM for sorting, then format for label
                const sortKey = dayjs(item.date).format('YYYY-MM');

                if (!grouped[sortKey]) {
                    grouped[sortKey] = {
                        label: monthKey,
                        total: 0
                    };
                }
                grouped[sortKey].total += parseFloat(item.total) || 0;
            });

            // Sort by key (YYYY-MM)
            const sortedKeys = Object.keys(grouped).sort();

            return {
                labels: sortedKeys.map(key => grouped[key].label),
                values: sortedKeys.map(key => grouped[key].total)
            };
        }
    }, [data, viewType]);

    const chartData = {
        labels: processedData.labels,
        datasets: [
            {
                label: 'Total Revenue',
                data: processedData.values,
                fill: false,
                backgroundColor: viewType === 'monthly' ? 'rgb(124, 58, 237)' : 'rgba(124, 58, 237, 0.2)',
                borderColor: 'rgb(124, 58, 237)', // Violet-600
                tension: 0, // Straight lines
                pointBackgroundColor: 'rgb(124, 58, 237)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(124, 58, 237)',
                borderRadius: viewType === 'monthly' ? 4 : 0,
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
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: function (value) {
                        return '$' + value.toLocaleString();
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 90,
                    minRotation: 90,
                }
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
                <Select
                    value={viewType}
                    onChange={setViewType}
                    size="small"
                    style={{ width: 100 }}
                    className="rounded"
                >
                    <Option value="daily">Daily</Option>
                    <Option value="monthly">Monthly</Option>
                </Select>
            </div>
            <div className="flex-1 min-h-[300px]">
                {viewType === 'daily' ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
