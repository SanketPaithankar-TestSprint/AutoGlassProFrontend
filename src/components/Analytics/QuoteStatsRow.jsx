import React from 'react';
import { Card, Statistic, Progress } from 'antd';
import { FieldTimeOutlined, FileSyncOutlined, ThunderboltOutlined } from '@ant-design/icons';

const QuoteStatsRow = ({ quoteAnalysis }) => {
    if (!quoteAnalysis) return null;

    const {
        conversion_rate,
        quote_to_workorder_rate,
        avg_quote_to_invoice_days
    } = quoteAnalysis;

    const StatCard = ({ title, value, prefix, suffix, icon, color, progress }) => (
        <Card bordered={false} className="shadow-sm rounded-xl h-full border border-slate-100">
            <div className="flex items-start justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">{title}</div>
                <div className="p-2 rounded-lg bg-opacity-10" style={{ backgroundColor: `${color}1A`, color: color }}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-slate-800">
                    {prefix}{value}{suffix}
                </div>
            </div>
            {progress !== undefined && (
                <div className="mt-3">
                    <Progress
                        percent={progress}
                        showInfo={false}
                        strokeColor={color}
                        trailColor="#f1f5f9"
                        size="small"
                    />
                </div>
            )}
            {progress === undefined && (
                <div className="mt-3 text-xs text-slate-400">
                    Average time to convert
                </div>
            )}
        </Card>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Quote to Invoice Rate (Conversion Rate) */}
            <StatCard
                title="Quote to Invoice Rate"
                value={conversion_rate || 0}
                suffix="%"
                icon={<ThunderboltOutlined className="text-xl" />}
                color="#7E5CFE" // Primary Purple
                progress={conversion_rate || 0}
            />

            {/* Quote to Work Order Rate */}
            <StatCard
                title="Quote to Work Order Rate"
                value={quote_to_workorder_rate || 0}
                suffix="%"
                icon={<FileSyncOutlined className="text-xl" />}
                color="#00A8E4" // Primary Cyan
                progress={quote_to_workorder_rate || 0}
            />

            {/* Avg Days to Invoice */}
            <StatCard
                title="Avg Days to Invoice"
                value={avg_quote_to_invoice_days || 0}
                suffix=" days"
                icon={<FieldTimeOutlined className="text-xl" />}
                color="#EC4899" // Accent Pink
            />
        </div>
    );
};

export default QuoteStatsRow;
