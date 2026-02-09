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
                        case 0: return '#94A3B8'; // Draft: Slate
                        case 1: return '#7E5CFE'; // Quoted: Primary Purple
                        case 2: return '#FFC107'; // Pending: Amber/Gold
                        case 3: return '#00A8E4'; // Confirmed: Primary Cyan
                        case 4: return '#3B82F6'; // Scheduled: Royal Blue
                        case 5: return '#8B5CF6'; // In Progress: Violet
                        case 6: return '#10B981'; // Completed: Emerald
                        case 7: return '#EF4444'; // Cancelled: Red
                        case 8: return '#06B6D4'; // Sent: Cyan-Teal
                        case 9: return '#EC4899'; // Viewed: Pink/Magenta
                        case 10: return '#F59E0B'; // Partial Paid: Orange
                        case 11: return '#059669'; // Paid: Darker Emerald
                        case 12: return '#DC2626'; // Overdue: Dark Red
                        case 13: return '#F97316'; // Refunded: Bright Orange
                        case 14: return '#6366F1'; // Accepted: Indigo
                        default: return '#CBD5E1'; // Fallback: Light Slate
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
