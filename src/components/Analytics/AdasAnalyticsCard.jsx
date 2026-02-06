import React from 'react';
import { Card, Statistic } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const AdasAnalyticsCard = ({ data }) => {
    if (!data) return null;

    const { adas_count } = data;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <SafetyCertificateOutlined className="text-2xl text-orange-500" />
                </div>
                <div>
                    <div className="text-slate-500 font-medium mb-1">ADAS Calibrations</div>
                    <div className="text-2xl font-bold text-slate-800">{adas_count}</div>
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
                Total completed calibrations in selected period
            </div>
        </div>
    );
};

export default AdasAnalyticsCard;
