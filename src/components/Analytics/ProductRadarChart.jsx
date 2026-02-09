import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const ProductRadarChart = ({ data }) => {
    // If no data, use default empty or the sample from prompt for visualization if prop is missing
    const chartDataItems = data || [
        { "code": "D", "name": "Door", "count": 15 },
        { "code": "W", "name": "Windshield", "count": 11 },
        { "code": "B", "name": "Back Glass", "count": 7 },
        { "code": "Q", "name": "Quarter", "count": 4 },
        { "code": "V", "name": "Vent", "count": 2 }
    ];

    const chartData = {
        labels: chartDataItems.map(item => item.name),
        datasets: [
            {
                label: 'Installations',
                data: chartDataItems.map(item => item.count),
                backgroundColor: 'rgba(126, 92, 254, 0.2)', // Purple transparent
                borderColor: '#7E5CFE', // Purple solid
                pointBackgroundColor: '#7E5CFE',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#7E5CFE',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    display: false, // Clean look
                    stepSize: 5,
                },
                pointLabels: {
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    color: '#64748b', // Slate-500
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false,
            }
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Glass Type Distribution</h3>
            <div className="flex-1 min-h-[300px] relative">
                <Radar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default ProductRadarChart;
