import React, { useState } from 'react';
import { Select, DatePicker, Collapse, Button, Tag, Checkbox } from 'antd';
import { FilterOutlined, ClearOutlined, CalendarOutlined, CarOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { getDateRangeOptions } from './helpers/utils';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const CustomerSidebarFilters = ({
    // Date Range Filter
    dateRangeFilter,
    setDateRangeFilter,
    customDateRange,
    setCustomDateRange,

    // Boolean Filters
    hasVehicleFilter,
    setHasVehicleFilter,
    hasEmailFilter,
    setHasEmailFilter,
    taxExemptFilter,
    setTaxExemptFilter,

    // Clear all
    onClearAll,

    // Active filter count
    activeFilterCount = 0,
}) => {
    const [expandedPanels, setExpandedPanels] = useState(['properties', 'dateRange']); // Expand by default

    const dateRangeOptions = getDateRangeOptions();

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
                {/* Properties Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CheckSquareOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Properties</span>
                        </div>
                    }
                    key="properties"
                    className="mb-2"
                >
                    <div className="flex flex-col gap-3">
                        <Checkbox checked={hasVehicleFilter} onChange={(e) => setHasVehicleFilter(e.target.checked)}>
                            Has Vehicle
                        </Checkbox>
                        <Checkbox checked={hasEmailFilter} onChange={(e) => setHasEmailFilter(e.target.checked)}>
                            Has Email
                        </Checkbox>
                        <Checkbox checked={taxExemptFilter} onChange={(e) => setTaxExemptFilter(e.target.checked)}>
                            Tax Exempt (Org)
                        </Checkbox>
                    </div>
                </Panel>

                {/* Date Range Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Date Added</span>
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
            </Collapse>

            {/* Filter Summary */}
            {activeFilterCount > 0 && (
                <div className="mt-auto pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-1">
                        {hasVehicleFilter && (
                            <Tag color="blue" closable onClose={() => setHasVehicleFilter(false)}>Has Vehicle</Tag>
                        )}
                        {hasEmailFilter && (
                            <Tag color="cyan" closable onClose={() => setHasEmailFilter(false)}>Has Email</Tag>
                        )}
                        {taxExemptFilter && (
                            <Tag color="purple" closable onClose={() => setTaxExemptFilter(false)}>Tax Exempt</Tag>
                        )}
                        {dateRangeFilter && dateRangeFilter !== 'all' && (
                            <Tag color="green" closable onClose={() => { setDateRangeFilter('all'); setCustomDateRange(null); }}>
                                Date: {dateRangeFilter === 'week' ? '7 Days' : dateRangeFilter === 'month' ? '30 Days' : 'Custom'}
                            </Tag>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSidebarFilters;
