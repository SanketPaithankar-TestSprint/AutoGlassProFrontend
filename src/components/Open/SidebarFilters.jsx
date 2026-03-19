import React, { useState } from 'react';
import { Select, Slider, DatePicker, Collapse, Button, Tag, InputNumber, Space, Checkbox } from 'antd';
import { FilterOutlined, ClearOutlined, CalendarOutlined, DollarOutlined, FileOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getStatusOptions, getDocumentTypeOptions, getDateRangeOptions } from './helpers/utils';

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
    // Has Insurance Filter
    hasInsuranceFilter,
    setHasInsuranceFilter,
    // Clear all
    onClearAll,
    // Active filter count
    activeFilterCount = 0,
}) => {
    const { t } = useTranslation();
    const [expandedPanels, setExpandedPanels] = useState([]);

    const statusOptions = getStatusOptions(t);
    const documentTypeOptions = getDocumentTypeOptions(t);
    const dateRangeOptions = getDateRangeOptions(t);

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
                    <h2 className="text-lg font-bold text-slate-900">{t('openRoute.filters.title')}</h2>
                    {activeFilterCount > 0 && (
                        <Tag color="violet" className="ml-2">
                            {activeFilterCount} {t('openRoute.filters.active')}
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
                        {t('openRoute.filters.clear')}
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
                            <span className="font-semibold text-slate-700">{t('openRoute.filters.documentType')}</span>
                        </div>
                    }
                    key="documentType"
                    className="mb-2"
                >
                    <Select
                        mode="single"
                        style={{ width: '100%' }}
                        placeholder={t('openRoute.filters.selectDocumentTypes')}
                        value={documentTypeFilter === 'all' ? null : documentTypeFilter}
                        onChange={(val) => setDocumentTypeFilter(val || 'all')}
                        options={documentTypeOptions.filter(opt => opt.value !== 'all')}
                        allowClear
                    />
                </Panel>

                {/* Status & Overdue Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">{t('openRoute.filters.status')} & {t('openRoute.filters.overdue')}</span>
                        </div>
                    }
                    key="status"
                    className="mb-2"
                >
                    <div className="space-y-8">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder={t('openRoute.filters.selectStatuses')}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions.filter(opt => opt.value !== 'all')}
                            allowClear
                            maxTagCount={2}
                        />
                        <Checkbox
                            checked={overdueFilter}
                            onChange={(e) => {
                                setOverdueFilter(e.target.checked);
                                if (e.target.checked) {
                                    setDocumentTypeFilter('all');
                                }
                            }}
                            className="text-slate-700"
                        >
                            <span className="text-sm flex items-center gap-1">
                                {t('openRoute.filters.overdueDocuments')}
                            </span>
                        </Checkbox>
                        <Checkbox
                            checked={hasInsuranceFilter}
                            onChange={(e) => setHasInsuranceFilter(e.target.checked)}
                            className="text-slate-700"
                        >
                            <span className="text-sm flex items-center gap-1">
                                {t('openRoute.filters.hasInsurance', 'Has Insurance')}
                            </span>
                        </Checkbox>
                    </div>
                </Panel>

                {/* Date Range Filter */}
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">{t('openRoute.filters.dateRange')}</span>
                        </div>
                    }
                    key="dateRange"
                    className="mb-2"
                >
                    <div className="space-y-3">
                        <Select
                            style={{ width: '100%' }}
                            placeholder={t('openRoute.filters.selectDateRange')}
                            value={dateRangeFilter}
                            onChange={handleDateRangeTypeChange}
                            options={dateRangeOptions}
                            allowClear
                        />

                        {dateRangeFilter === 'custom' && (
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{t('openRoute.filters.startDate')}</label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={customDateRange?.[0]}
                                        onChange={(date) => {
                                            const newRange = [date, customDateRange?.[1] || null];
                                            handleCustomDateChange(newRange);
                                        }}
                                        format="YYYY-MM-DD"
                                        placeholder={t('openRoute.filters.selectStartDate')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{t('openRoute.filters.endDate')}</label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={customDateRange?.[1]}
                                        onChange={(date) => {
                                            const newRange = [customDateRange?.[0] || null, date];
                                            handleCustomDateChange(newRange);
                                        }}
                                        format="YYYY-MM-DD"
                                        placeholder={t('openRoute.filters.selectEndDate')}
                                        disabledDate={(current) => {
                                            // Disable dates before start date
                                            if (!customDateRange?.[0]) return false;
                                            return current && current < customDateRange[0].startOf('day');
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* Amount Range Filter */}
                {/*  <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <DollarOutlined className="text-slate-400" />
                            <span className="font-semibold text-slate-700">{t('openRoute.filters.amountRange')}</span>
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
                    <p className="text-xs text-slate-500 mb-2">{t('openRoute.filters.activeFilters')}</p>
                    <div className="flex flex-wrap gap-1">
                        {documentTypeFilter && documentTypeFilter !== 'all' && (
                            <Tag color="purple" closable onClose={() => setDocumentTypeFilter('all')}>
                                {t('openRoute.filters.type')}: {t(`openRoute.documentTypes.${documentTypeFilter}`)}
                            </Tag>
                        )}
                        {statusFilter && statusFilter.length > 0 && (
                            <Tag color="blue" closable onClose={() => setStatusFilter([])}>
                                {t('openRoute.filters.status')}: {statusFilter.length}
                            </Tag>
                        )}
                        {dateRangeFilter && dateRangeFilter !== 'all' && (
                            <Tag color="green" closable onClose={() => { setDateRangeFilter('all'); setCustomDateRange(null); }}>
                                {t('openRoute.filters.date')}: {dateRangeFilter === 'week' ? t('openRoute.dateRangeOptions.week') : dateRangeFilter === 'month' ? t('openRoute.dateRangeOptions.month') : t('openRoute.dateRangeOptions.custom')}
                            </Tag>
                        )}
                        {(amountRange[0] > 0 || amountRange[1] < 100000) && (
                            <Tag color="orange" closable onClose={() => setAmountRange([0, 100000])}>
                                ${amountRange[0].toLocaleString()} - ${amountRange[1].toLocaleString()}
                            </Tag>
                        )}
                        {overdueFilter && (
                            <Tag color="red" closable onClose={() => setOverdueFilter(false)}>
                                {t('openRoute.filters.overdueOnly')}
                            </Tag>
                        )}
                        {hasInsuranceFilter && (
                            <Tag color="blue" closable onClose={() => setHasInsuranceFilter(false)}>
                                {t('openRoute.filters.hasInsurance', 'Has Insurance')}
                            </Tag>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarFilters;
