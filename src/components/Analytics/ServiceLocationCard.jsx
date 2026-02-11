import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MapPin, Package } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const ServiceLocationCard = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No service location data available</p>
            </div>
        );
    }

    const { in_shop_count, mobile_count } = data;
    const total = in_shop_count + mobile_count;

    const chartData = {
        labels: ['In-Shop', 'Mobile'],
        datasets: [
            {
                data: [in_shop_count, mobile_count],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                ],
                borderColor: '#fff',
                borderWidth: 3,
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
                        const value = context.parsed;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '68%',
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-base font-bold text-slate-700 mb-3">Service Location</h3>

            <div className="flex items-center justify-center mb-3">
                <div className="relative w-36 h-36">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</p>
                        <p className="text-base font-bold text-slate-800">{total}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm text-slate-500">In-Shop</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-slate-700">{in_shop_count}</span>
                        <span className="text-xs text-slate-400 ml-1">
                            ({total > 0 ? ((in_shop_count / total) * 100).toFixed(1) : 0}%)
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-500">Mobile</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-slate-700">{mobile_count}</span>
                        <span className="text-xs text-slate-400 ml-1">
                            ({total > 0 ? ((mobile_count / total) * 100).toFixed(1) : 0}%)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceLocationCard;
