import React from 'react';
import { Card, Tag, Button, Tooltip } from 'antd';
import { FileTextOutlined, UserOutlined, CarOutlined, CalendarOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { getStatusColor, getTypeColor, formatCurrency, formatDate, isOverdue, getDaysOverdue } from './helpers/utils';

const PremiumDocumentCard = ({
    document: doc,
    onClick,
    onDelete,
    isListMode = false,
}) => {
    const { documentNumber, documentType, status, customerName, vehicleInfo, totalAmount, createdAt, balanceDue } = doc;

    const docIsOverdue = isOverdue(doc);
    const daysOverdue = getDaysOverdue(doc);

    // Get border color based on status
    // Overdue = orange, Completed/Paid = green, Not completed = yellow
    const getBorderColor = () => {
        // If overdue, always show orange
        if (docIsOverdue) {
            return '#F97316'; // orange
        }

        const statusLower = status?.toLowerCase();

        // Completed or Paid = green
        if (statusLower === 'completed' || statusLower === 'paid') {
            return '#22C55E'; // green
        }

        // Cancelled = red
        if (statusLower === 'cancelled') {
            return '#EF4444'; // red
        }

        // Everything else (pending, in_progress, etc.) = yellow (not completed)
        return '#FBBF24'; // yellow
    };

    const borderColor = getBorderColor();

    // List Mode Rendering
    if (isListMode) {
        return (
            <div
                onClick={() => onClick(doc)}
                className="w-full cursor-pointer hover:bg-slate-50 transition-all duration-200 px-4 py-3 border border-slate-200 rounded-lg mb-1 hover:shadow-md"
                style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
            >
                {/* Mobile Layout */}
                <div className="flex flex-col gap-2 lg:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileTextOutlined className="text-slate-600 text-sm" />
                            <span className="font-bold text-slate-900 text-sm">{documentNumber}</span>
                            <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[9px] m-0">
                                {documentType?.replace('_', ' ')}
                            </Tag>
                        </div>
                        <Tooltip title="Delete Document">
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(doc);
                                }}
                            />
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <UserOutlined className="text-slate-400" />
                        <span className="truncate">{customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                            <CarOutlined className="text-slate-400" />
                            <span className="truncate">{vehicleInfo}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalAmount)}</span>
                            <span className={`font-medium text-xs ${(balanceDue || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                Bal: {formatCurrency(balanceDue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tablet Layout - showing customer name */}
                <div className="hidden lg:hidden md:flex items-center gap-2 py-1">
                    <FileTextOutlined className="text-slate-600 text-sm w-[16px] flex-shrink-0" />
                    <span className="font-bold text-slate-900 text-sm w-[90px] truncate">{documentNumber}</span>
                    <div className="w-[70px] flex justify-center flex-shrink-0">
                        <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[9px] m-0">
                            {documentType?.replace('_', ' ')}
                        </Tag>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <UserOutlined className="text-slate-400 flex-shrink-0 text-xs" />
                        <span className="text-slate-700 text-sm truncate">{customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 w-[100px] flex-shrink-0">
                        <CarOutlined className="text-slate-400 flex-shrink-0 text-xs" />
                        <span className="text-slate-600 text-sm truncate">{vehicleInfo}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm w-[80px] text-right flex-shrink-0">
                        {formatCurrency(totalAmount)}
                    </span>
                    <div className="w-[32px] flex justify-center flex-shrink-0">
                        <Tooltip title="Delete Document">
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(doc);
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Desktop Layout - Full width display with all columns */}
                <div className="hidden lg:flex items-center gap-2">
                    {/* Left side - matches header: icon(16px) | Doc#(110px) | Type(80px) | Name(160px) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <FileTextOutlined className="text-slate-600 w-[16px] flex-shrink-0" />
                        <span className="font-bold text-slate-900 text-sm w-[110px] truncate">{documentNumber}</span>
                        <div className="w-[80px] flex justify-center flex-shrink-0">
                            <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[10px] m-0">
                                {documentType?.replace('_', ' ')}
                            </Tag>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <UserOutlined className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-700 text-sm">{customerName}</span>
                        </div>
                        {docIsOverdue && (
                            <Tag color="orange" className="text-[10px] m-0 flex-shrink-0">
                                <WarningOutlined /> {daysOverdue}d
                            </Tag>
                        )}
                    </div>

                    {/* Right side - matches header: Vehicle(130px) | Date(100px) | Total(90px) | Balance(90px) | Delete(32px) */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                        <div className="flex items-center gap-2 w-[130px] min-w-0">
                            <CarOutlined className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600 text-sm truncate">{vehicleInfo}</span>
                        </div>

                        <span className="font-bold text-slate-900 text-sm w-[90px] text-right">
                            {formatCurrency(totalAmount)}
                        </span>
                        <span className={`font-medium text-sm w-[90px] text-right ${(balanceDue || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {formatCurrency(balanceDue)}
                        </span>
                        <div className="w-[32px] flex justify-center">
                            <Tooltip title="Delete Document">
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(doc);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid Mode Rendering
    return (
        <Card
            hoverable
            onClick={() => onClick(doc)}
            className="w-full transition-all duration-300 hover:shadow-lg border border-slate-200 rounded-xl overflow-hidden"
            style={{ borderTopWidth: '4px', borderTopColor: borderColor }}
            styles={{ body: { padding: '12px' } }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5">
                    <FileTextOutlined className="text-violet-600 text-sm sm:text-lg" />
                    <span className="font-bold text-slate-800 text-xs sm:text-base">{documentNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[8px] sm:text-[10px] m-0">
                        {documentType?.replace('_', ' ')}
                    </Tag>
                    {docIsOverdue && (
                        <Tooltip title={`${daysOverdue} days overdue`}>
                            <Tag color="orange" className="text-[8px] sm:text-[10px] m-0">
                                <WarningOutlined />
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm">
                    <UserOutlined className="text-slate-400 text-xs" />
                    <span className="truncate">{customerName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm">
                    <CarOutlined className="text-slate-400 text-xs" />
                    <span className="truncate">{vehicleInfo}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm">
                    <CalendarOutlined className="text-slate-400 text-xs" />
                    <span>{formatDate(createdAt)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="flex flex-col">
                    <span className="text-[9px] sm:text-xs text-slate-500">Total</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-base">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] sm:text-xs text-slate-500">Balance</span>
                    <span className={`font-medium text-xs sm:text-base ${(balanceDue || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {formatCurrency(balanceDue)}
                    </span>
                </div>
                <Tooltip title="Delete Document">
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined className="text-xs" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc);
                        }}
                    />
                </Tooltip>
            </div>
        </Card>
    );
};

export default React.memo(PremiumDocumentCard);
