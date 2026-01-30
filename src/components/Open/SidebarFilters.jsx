import React, { useState } from 'react';
import { Select, Slider, DatePicker, Collapse, Button, Tag, InputNumber, Space, Checkbox } from 'antd';
import { FilterOutlined, ClearOutlined, CalendarOutlined, DollarOutlined, FileOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getStatusOptions, getDocumentTypeOptions, getDateRangeOptions } from './helpers/utils';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const SidebarFilters = ({
    // Document Type Filter
    documentTypeFilter,
    setDocumentTypeFilter,
    // Status Filter
    statusFilter,
    setStatusFilter,
    // Amount Range Filter
    amountRange,
    setAmountRange,
    // Date Range Filter
    dateRangeFilter,
    setDateRangeFilter,
    customDateRange,
    setCustomDateRange,
    // Overdue Filter
    overdueFilter,
    setOverdueFilter,
    // Clear all
    onClearAll,
    // Active filter count
    activeFilterCount = 0,
}) => {
    const [expandedPanels, setExpandedPanels] = useState([]);

    const statusOptions = getStatusOptions();
    const documentTypeOptions = getDocumentTypeOptions();
    const dateRangeOptions = getDateRangeOptions();

    const handleAmountChange = (value) => {
        setAmountRange(value);
    };

    const handleDateRangeTypeChange = (value) => {
        setDateRangeFilter(value);
        if (value !== 'custom') {
            setCustomDateRange(null);
        }
    };

    const handleCustomDateChange = (dates) => {
        setCustomDateRange(dates);
        if (dates && dates.length === 2) {
            setDateRangeFilter('custom');
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FilterOutlined className="text-violet-600 text-lg" />
                    <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                    {activeFilterCount > 0 && (
                        <Tag color="violet" className="ml-2">
                            {activeFilterCount} active
                        </Tag>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<ClearOutlined />}
                        onClick={onClearAll}
                        className="text-slate-500 hover:text-violet-600"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Filter Sections */}
            <Collapse
                activeKey={expandedPanels}
                onChange={setExpandedPanels}
                bordered={false}
                expandIconPosition="end"
                className="bg-transparent filter-collapse"
            >
                {/* Document Type Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <FileOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Document Type</span>
                        </div>
                    }
                    key="documentType"
                    className="mb-2"
                >
                    <Select
                        mode="single"
                        style={{ width: '100%' }}
                        placeholder="Select document types"
                        value={documentTypeFilter}
                        onChange={setDocumentTypeFilter}
                        options={documentTypeOptions.filter(opt => opt.value !== 'all')}
                        allowClear
                        maxTagCount={2}
                    />
                </Panel>

                {/* Status & Overdue Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Status & Overdue</span>
                        </div>
                    }
                    key="status"
                    className="mb-2"
                >
                    <div className="space-y-8">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Select statuses"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions.filter(opt => opt.value !== 'all')}
                            allowClear
                            maxTagCount={2}
                        />
                        <Checkbox
                            checked={overdueFilter}
                            onChange={(e) => setOverdueFilter(e.target.checked)}
                            className="text-slate-700"
                        >
                            <span className="text-sm flex items-center gap-1">
                                overdue documents
                            </span>
                        </Checkbox>
                    </div>
                </Panel>

                {/* Date Range Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Date Range</span>
                        </div>
                    }
                    key="dateRange"
                    className="mb-2"
                >
                    <div className="space-y-3">
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Select date range"
                            value={dateRangeFilter}
                            onChange={handleDateRangeTypeChange}
                            options={dateRangeOptions}
                            allowClear
                        />
                        
                        {dateRangeFilter === 'custom' && (
                            <RangePicker
                                style={{ width: '100%' }}
                                value={customDateRange}
                                onChange={handleCustomDateChange}
                                format="YYYY-MM-DD"
                            />
                        )}
                    </div>
                </Panel>

                {/* Amount Range Filter */}
              {/*  <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <DollarOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Amount Range</span>
                        </div>
                    }
                    key="amount"
                    className="mb-2"
                >
                    <div className="space-y-4">
                        <Slider
                            range
                            min={0}
                            max={100000}
                            step={1000}
                            value={amountRange}
                            onChange={handleAmountChange}
                            tooltip={{
                                formatter: (value) => `$${value?.toLocaleString()}`
                            }}
                            marks={{
                                0: '$0',
                                50000: '$50k',
                                100000: '$100k'
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <Space.Compact>
                                <InputNumber
                                    prefix="$"
                                    min={0}
                                    max={amountRange[1]}
                                    value={amountRange[0]}
                                    onChange={(val) => setAmountRange([val || 0, amountRange[1]])}
                                    style={{ width: 100 }}
                                    size="small"
                                />
                                <span className="px-2 text-slate-400">-</span>
                                <InputNumber
                                    prefix="$"
                                    min={amountRange[0]}
                                    max={100000}
                                    value={amountRange[1]}
                                    onChange={(val) => setAmountRange([amountRange[0], val || 100000])}
                                    style={{ width: 100 }}
                                    size="small"
                                />
                            </Space.Compact>
                        </div>
                    </div>
                </Panel> */}
            </Collapse>

            {/* Filter Summary */}
            {activeFilterCount > 0 && (
                <div className="mt-auto pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-1">
                        {documentTypeFilter && documentTypeFilter.length > 0 && (
                            <Tag color="purple" closable onClose={() => setDocumentTypeFilter([])}>
                                Type: {documentTypeFilter.length}
                            </Tag>
                        )}
                        {statusFilter && statusFilter.length > 0 && (
                            <Tag color="blue" closable onClose={() => setStatusFilter([])}>
                                Status: {statusFilter.length}
                            </Tag>
                        )}
                        {dateRangeFilter && dateRangeFilter !== 'all' && (
                            <Tag color="green" closable onClose={() => { setDateRangeFilter('all'); setCustomDateRange(null); }}>
                                Date: {dateRangeFilter === 'week' ? '7 Days' : dateRangeFilter === 'month' ? '30 Days' : 'Custom'}
                            </Tag>
                        )}
                        {(amountRange[0] > 0 || amountRange[1] < 100000) && (
                            <Tag color="orange" closable onClose={() => setAmountRange([0, 100000])}>
                                ${amountRange[0].toLocaleString()} - ${amountRange[1].toLocaleString()}
                            </Tag>
                        )}
                        {overdueFilter && (
                            <Tag color="red" closable onClose={() => setOverdueFilter(false)}>
                                Overdue Only
                            </Tag>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarFilters;
