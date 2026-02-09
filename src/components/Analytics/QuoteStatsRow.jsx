import React from 'react';
import { Card, Statistic, Progress } from 'antd';
import { FieldTimeOutlined, FileSyncOutlined, ThunderboltOutlined, FileTextOutlined, FileDoneOutlined } from '@ant-design/icons';

const QuoteStatsRow = ({ quoteAnalysis }) => {
    if (!quoteAnalysis) return null;

    const {
        conversion_rate,
        quote_to_workorder_rate,
        avg_quote_to_invoice_days,
        quotes_created,
        invoices_count
    } = quoteAnalysis;

    // Strict Purple Color
    const PURPLE = '#7E5CFE';

    const StatCard = ({ title, value, prefix, suffix, icon, progress }) => (
        <Card bordered={false} className="shadow-sm rounded-xl h-full border border-slate-100">
            <div className="flex items-start justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">{title}</div>
                <div
                    className="p-2 rounded-lg bg-opacity-10"
                    style={{ backgroundColor: `${PURPLE}1A`, color: PURPLE }}
                >
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
                        strokeColor={PURPLE}
                        trailColor="#f1f5f9"
                        size="small"
                    />
                </div>
            )}
            {progress === undefined && (
                <div className="mt-3 text-xs text-slate-400">
                    Key Performance Metric
                </div>
            )}
        </Card>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            {/* 1. Total Quotes */}
            <StatCard
                title="Total Quotes"
                value={quotes_created || 0}
                icon={<FileTextOutlined className="text-xl" />}
            />

            {/* 2. Invoices Generated */}
            <StatCard
                title="Invoices Generated"
                value={invoices_count || 0}
                icon={<FileDoneOutlined className="text-xl" />}
            />

            {/* 3. Quote to Work Order Rate */}
            <StatCard
                title="Quote to Work Order"
                value={quote_to_workorder_rate || 0}
                suffix="%"
                icon={<FileSyncOutlined className="text-xl" />}
                progress={quote_to_workorder_rate || 0}
            />

            {/* 4. Conversion Rate */}
            <StatCard
                title="Conversion Rate"
                value={conversion_rate || 0}
                suffix="%"
                icon={<ThunderboltOutlined className="text-xl" />}
                progress={conversion_rate || 0}
            />

            {/* 5. Avg Days to Invoice */}
            <StatCard
                title="Avg Days to Invoice"
                value={avg_quote_to_invoice_days || 0}
                suffix=" days"
                icon={<FieldTimeOutlined className="text-xl" />}
            />
        </div>
    );
};

export default QuoteStatsRow;
