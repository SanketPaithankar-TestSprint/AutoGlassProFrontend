import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusDistribution = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">No status data available</div>;
    }

    const chartData = {
        labels: data.map(item => {
            const s = Number(item.status);
            switch (s) {
                case 0: return 'Draft';
                case 1: return 'Quoted';
                case 2: return 'Pending';
                case 3: return 'Confirmed';
                case 4: return 'Scheduled';
                case 5: return 'In Progress';
                case 6: return 'Completed';
                case 7: return 'Cancelled';
                case 8: return 'Sent';
                case 9: return 'Viewed';
                case 10: return 'Partial Paid';
                case 11: return 'Paid';
                case 12: return 'Overdue';
                case 13: return 'Refunded';
                case 14: return 'Accepted';
                default: return String(item.status);
            }
        }),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: data.map(item => {
                    const s = Number(item.status);
                    switch (s) {
                        case 0: return '#9ca3af'; // Draft: Gray
                        case 1: return '#818cf8'; // Quoted: Indigo
                        case 2: return '#facc15'; // Pending: Yellow
                        case 3: return '#60a5fa'; // Confirmed: Blue
                        case 4: return '#22d3ee'; // Scheduled: Cyan
                        case 5: return '#c084fc'; // In Progress: Purple
                        case 6: return '#4ade80'; // Completed: Green
                        case 7: return '#f87171'; // Cancelled: Red
                        case 8: return '#2dd4bf'; // Sent: Teal
                        case 9: return '#f472b6'; // Viewed: Pink
                        case 10: return '#fbbf24'; // Partial Paid: Amber
                        case 11: return '#34d399'; // Paid: Emerald
                        case 12: return '#ef4444'; // Overdue: Red
                        case 13: return '#fb923c'; // Refunded: Orange
                        case 14: return '#a3e635'; // Accepted: Lime
                        default: return '#cbd5e1'; // Fallback: Slate
                    }
                }),
                borderWidth: 1,
            },
        ],

    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                }
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Job Status</h3>
            <div className="flex-1 min-h-[250px]">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StatusDistribution;
