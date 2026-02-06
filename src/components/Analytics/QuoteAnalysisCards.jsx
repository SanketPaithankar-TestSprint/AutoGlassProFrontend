import React from 'react';
import { Card, Progress, Statistic, Row, Col } from 'antd';
import { FileTextOutlined, FileDoneOutlined, PercentageOutlined } from '@ant-design/icons';

const QuoteAnalysisCards = ({ data }) => {
    if (!data) return null;

    const { quotes_created, invoices_count, conversion_rate } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-sm rounded-xl border-slate-100">
                <Statistic
                    title={<span className="text-slate-500 font-medium">Total Quotes</span>}
                    value={quotes_created}
                    prefix={<FileTextOutlined className="text-blue-500 mr-2" />}
                    valueStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
            </Card>

            <Card className="shadow-sm rounded-xl border-slate-100">
                <Statistic
                    title={<span className="text-slate-500 font-medium">Invoices Generated</span>}
                    value={invoices_count}
                    prefix={<FileDoneOutlined className="text-green-500 mr-2" />}
                    valueStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
            </Card>

            <Card className="shadow-sm rounded-xl border-slate-100 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-medium">Conversion Rate</span>
                    <PercentageOutlined className="text-purple-500" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-slate-800">{conversion_rate}%</span>
                    <Progress
                        percent={conversion_rate}
                        showInfo={false}
                        strokeColor="#8b5cf6"
                        trailColor="#f1f5f9"
                        size="small"
                        className="flex-1"
                    />
                </div>
            </Card>
        </div>
    );
};

export default QuoteAnalysisCards;
