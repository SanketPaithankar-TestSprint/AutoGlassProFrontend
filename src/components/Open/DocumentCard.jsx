import React from 'react';
import { Card, Tag } from 'antd';
import { FileTextOutlined, UserOutlined, CarOutlined, CalendarOutlined } from '@ant-design/icons';

const DocumentCard = ({ document, onClick }) => {
    const { documentNumber, documentType, status, customerName, vehicleInfo, totalAmount, createdAt } = document;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'gold';
            case 'in_progress': return 'blue';
            case 'completed': return 'green';
            case 'paid': return 'purple';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'quote': return 'purple';
            case 'work_order': return 'orange';
            case 'invoice': return 'cyan';
            default: return 'default';
        }
    };

    return (
        <Card
            hoverable
            onClick={() => onClick(document)}
            className="w-full transition-all duration-300 hover:shadow-lg border border-slate-200 rounded-xl"
            styles={{ body: { padding: '16px' } }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-violet-600 text-lg" />
                    <span className="font-bold text-slate-800 text-base">{documentNumber}</span>
                </div>
                <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[10px] m-0">
                    {documentType?.replace('_', ' ')}
                </Tag>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <UserOutlined className="text-slate-400" />
                    <span className="truncate">{customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <CarOutlined className="text-slate-400" />
                    <span className="truncate">{vehicleInfo}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <CalendarOutlined className="text-slate-400" />
                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <Tag color={getStatusColor(status)} className="capitalize m-0">
                    {status?.replace('_', ' ')}
                </Tag>
                <span className="font-bold text-slate-900 text-lg">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount || 0)}
                </span>
            </div>
        </Card>
    );
};

export default DocumentCard;
