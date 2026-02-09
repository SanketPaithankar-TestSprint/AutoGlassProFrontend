import React from 'react';
import { Progress, Tooltip } from 'antd';
import { FileTextOutlined, FileDoneOutlined, PercentageOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Wallet } from 'lucide-react';

const TopKpiStats = ({ data }) => {
    if (!data) return null;

    const { quote_analysis, outstanding_balance, adas_analytics } = data;
    const { quotes_created, invoices_count, conversion_rate } = quote_analysis || {};
    const { adas_count } = adas_analytics || {};

    // Format currency for Outstanding Balance
    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(outstanding_balance || 0);

    const isBalanceHigh = outstanding_balance > 1000;

    const StatCard = ({ title, value, icon, subtext, content }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1 leading-tight">{title}</h4>
                    {content ? content : (
                        <div className={`text-2xl font-bold text-slate-800 mt-2`}>
                            {value}
                        </div>
                    )}
                </div>
                <div className={`p-2 rounded-lg ${typeof icon === 'object' ? '' : 'bg-slate-50'}`}>
                    {icon}
                </div>
            </div>
            {subtext && <div className="text-xs text-slate-400 mt-auto">{subtext}</div>}
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Card 1: Total Quotes */}
            <StatCard
                title="Total Quotes"
                value={quotes_created || 0}
                icon={<FileTextOutlined className="text-xl" style={{ color: '#7E5CFE' }} />}
            />

            {/* Card 2: Invoices Generated */}
            <StatCard
                title="Invoices Generated"
                value={invoices_count || 0}
                icon={<FileDoneOutlined className="text-xl" style={{ color: '#7E5CFE' }} />}
            />

            {/* Card 3: Conversion Rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-500">Conversion Rate</span>
                    <PercentageOutlined className="text-xl" style={{ color: '#7E5CFE' }} />
                </div>
                <div className="mt-2">
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-800">{conversion_rate || 0}%</span>
                    </div>
                    <Progress
                        percent={conversion_rate || 0}
                        showInfo={false}
                        strokeColor="#7E5CFE"
                        trailColor="#f1f5f9"
                        size="small"
                        className="m-0"
                    />
                </div>
            </div>

            {/* Card 4: Outstanding Balance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-1">Outstanding Balance</h4>
                        <div className={`text-2xl font-bold mt-2 ${isBalanceHigh ? 'text-red-500' : 'text-slate-800'}`}>
                            {formattedBalance}
                        </div>
                    </div>
                    <div className={`p-2 rounded-lg ${isBalanceHigh ? 'bg-red-50' : 'bg-slate-50'}`} style={{ color: '#7E5CFE' }}>
                        <Wallet size={20} />
                    </div>
                </div>
            </div>

            {/* Card 5: ADAS Calibrations */}
            <StatCard
                title="ADAS Calibrations"
                value={adas_count || 0}
                icon={<SafetyCertificateOutlined className="text-xl" style={{ color: '#7E5CFE' }} />}
            />
        </div>
    );
};

export default TopKpiStats;
