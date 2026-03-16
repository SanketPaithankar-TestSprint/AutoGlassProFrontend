import React, { useState } from 'react';
import { DatePicker, Button, Card, message, Spin, Empty, Select, Tooltip } from 'antd';
import { FileTextOutlined, DownloadOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSalesReport } from '../../api/getSalesReport';
import { useTranslation } from 'react-i18next';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsRoot = () => {
    const { t } = useTranslation();
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'month'),
        dayjs()
    ]);
    const [selectedDocTypes, setSelectedDocTypes] = useState([0]); // Default to Invoice (0)
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);

    const handleDateChange = (dates) => {
        setDateRange(dates);
    };

    const handleGenerateReport = async () => {
        console.log('[ReportsRoot] Generate Report clicked');
        console.log('[ReportsRoot] Date range:', dateRange);

        if (!dateRange || dateRange.length !== 2) {
            message.warning(t('reports.pleaseSelectDateRange'));
            return;
        }

        // Get userId from agp_profile_data (where the profile is stored)
        let userId = null;
        try {
            const profileData = localStorage.getItem('agp_profile_data');
            console.log('[ReportsRoot] Profile data from localStorage:', profileData);
            if (profileData) {
                const profile = JSON.parse(profileData);
                userId = profile.userId || profile.user_id || profile.id;
                console.log('[ReportsRoot] Extracted userId from profile:', userId);
            }
        } catch (e) {
            console.error('[ReportsRoot] Error parsing profile data:', e);
        }

        // Fallback to direct localStorage keys
        if (!userId) {
            userId = localStorage.getItem('userId') || localStorage.getItem('user_id') || localStorage.getItem('UserID');
        }

        console.log('[ReportsRoot] Final User ID:', userId);

        if (!userId) {
            // Debug: Show all localStorage keys and their values
            console.log('[ReportsRoot] All localStorage keys:', Object.keys(localStorage));
            for (const key of Object.keys(localStorage)) {
                console.log(`[ReportsRoot] ${key}:`, localStorage.getItem(key)?.substring(0, 200));
            }
            message.error(t('reports.userIdNotFound'));
            return;
        }

        const fromDate = dateRange[0].format('YYYY-MM-DD');
        const toDate = dateRange[1].format('YYYY-MM-DD');

        console.log('[ReportsRoot] Calling API with:', { userId, fromDate, toDate });

        setLoading(true);
        setPdfUrl(null);
        setPdfBlob(null);

        try {
            const blob = await getSalesReport(userId, fromDate, toDate, selectedDocTypes);
            console.log('[ReportsRoot] API returned blob:', blob);

            // Create a URL for the blob to display in iframe
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setPdfBlob(blob);

            message.success(t('reports.reportGeneratedSuccessfully'));
        } catch (error) {
            console.error('[ReportsRoot] Error generating report:', error);
            message.error(error.message || t('reports.failedToGenerateReport'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) {
            message.warning(t('reports.noReportToDownload'));
            return;
        }

        const fromDate = dateRange[0].format('YYYY-MM-DD');
        const toDate = dateRange[1].format('YYYY-MM-DD');
        const filename = `Sales_Report_${fromDate}_to_${toDate}.pdf`;

        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success(t('reports.reportDownloaded'));
    };

    // Cleanup URL on unmount
    React.useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    return (
        <div className="min-h-full bg-slate-100 p-3 sm:p-4 md:p-6">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-2">
                    <h1 className="!text-[30px] sm:text-xl md:text-2xl font-bold text-slate-900 m-0">
                        {t('reports.salesReports')}
                    </h1>
                    <Tooltip title={t('reports.generateAndDownloadTooltip')} placement="right">
                        <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                    </Tooltip>
                </div>

                {/* Controls Card */}
                <div className="mb-4 sm:mb-6 bg-white shadow-md rounded-xl sm:rounded-2xl overflow-hidden p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Document Type Filter */}
                        <div className="w-full">
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                                {t('reports.documentType')}
                            </label>
                            <Select
                                mode="multiple"
                                value={selectedDocTypes}
                                onChange={setSelectedDocTypes}
                                style={{ width: '100%' }}
                                placeholder={t('reports.selectDocType')}
                                maxTagCount="responsive"
                                className="w-full"
                            >
                                <Option value={0}>{t('reports.invoice')}</Option>
                                <Option value={1}>{t('reports.workOrder')}</Option>
                                <Option value={2}>{t('reports.quote')}</Option>
                            </Select>
                        </div>

                        {/* Date Range Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                                    {t('reports.fromDate')}
                                </label>
                                <DatePicker
                                    value={dateRange ? dateRange[0] : null}
                                    onChange={(date) => {
                                        if (date) {
                                            setDateRange([date, dateRange ? dateRange[1] : dayjs()]);
                                        }
                                    }}
                                    format="MM/DD/YYYY"
                                    size="middle"
                                    className="w-full rounded-lg"
                                    allowClear={false}
                                    disabledDate={(current) => {
                                        // Disable dates after the "To" date
                                        return dateRange && dateRange[1] && current && current.isAfter(dateRange[1], 'day');
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                                    {t('reports.toDate')}
                                </label>
                                <DatePicker
                                    value={dateRange ? dateRange[1] : null}
                                    onChange={(date) => {
                                        if (date) {
                                            setDateRange([dateRange ? dateRange[0] : dayjs().subtract(1, 'month'), date]);
                                        }
                                    }}
                                    format="MM/DD/YYYY"
                                    size="middle"
                                    className="w-full rounded-lg"
                                    allowClear={false}
                                    disabledDate={(current) => {
                                        // Disable dates before the "From" date
                                        return dateRange && dateRange[0] && current && current.isBefore(dateRange[0], 'day');
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                                type="primary"
                                size="middle"
                                icon={<SearchOutlined />}
                                onClick={handleGenerateReport}
                                loading={loading}
                                className="w-full sm:flex-1 h-9 sm:h-10 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm"
                            >
                                {t('reports.generateReport')}
                            </Button>

                            <Button
                                size="middle"
                                icon={<DownloadOutlined />}
                                onClick={handleDownload}
                                disabled={!pdfBlob}
                                className="w-full sm:flex-1 h-9 sm:h-10 rounded-lg border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300 text-xs sm:text-sm"
                            >
                                {t('reports.downloadPDF')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer */}
                <Card
                    className="shadow-md border-0 rounded-xl sm:rounded-2xl overflow-hidden"
                    styles={{ body: { padding: 0 } }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                            <Spin size="large" />
                            <p className="mt-4 text-xs sm:text-sm text-slate-500">{t('reports.generatingReport')}</p>
                        </div>
                    ) : pdfUrl ? (
                        <div className="w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                            <iframe
                                src={pdfUrl}
                                title={t('reports.salesReportPDF')}
                                className="w-full h-full border-0"
                                style={{ borderRadius: '0 0 12px 12px' }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span className="text-slate-400 text-xs sm:text-sm px-4 text-center block">
                                        {t('reports.selectDateRangeAndGenerate')}
                                    </span>
                                }
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ReportsRoot;
