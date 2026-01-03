import React, { useState } from 'react';
import { DatePicker, Button, Card, message, Spin, Empty } from 'antd';
import { FileTextOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSalesReport } from '../../api/getSalesReport';

const { RangePicker } = DatePicker;

const ReportsRoot = () => {
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'month'),
        dayjs()
    ]);
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
            message.warning('Please select a date range');
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
            message.error('User ID not found. Please log in again.');
            return;
        }

        const fromDate = dateRange[0].format('YYYY-MM-DD');
        const toDate = dateRange[1].format('YYYY-MM-DD');

        console.log('[ReportsRoot] Calling API with:', { userId, fromDate, toDate });

        setLoading(true);
        setPdfUrl(null);
        setPdfBlob(null);

        try {
            const blob = await getSalesReport(userId, fromDate, toDate);
            console.log('[ReportsRoot] API returned blob:', blob);

            // Create a URL for the blob to display in iframe
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setPdfBlob(blob);

            message.success('Report generated successfully!');
        } catch (error) {
            console.error('[ReportsRoot] Error generating report:', error);
            message.error(error.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) {
            message.warning('No report to download. Please generate a report first.');
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

        message.success('Report downloaded!');
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
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <FileTextOutlined className="text-white text-lg" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                        Sales Reports
                    </h1>
                </div>
                <p className="text-slate-500 ml-13">Generate and download sales breakdown reports</p>
            </div>

            {/* Controls Card */}
            <Card
                className="mb-6 shadow-md border-0 rounded-2xl overflow-hidden"
                styles={{ body: { padding: '24px' } }}
            >
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[280px]">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Date Range
                        </label>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            format="YYYY-MM-DD"
                            className="w-full"
                            size="large"
                            style={{ borderRadius: '12px' }}
                            allowClear={false}
                            presets={[
                                { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
                                { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
                                { label: 'Last 3 Months', value: [dayjs().subtract(3, 'month'), dayjs()] },
                                { label: 'Last 6 Months', value: [dayjs().subtract(6, 'month'), dayjs()] },
                                { label: 'This Year', value: [dayjs().startOf('year'), dayjs()] },
                            ]}
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={handleGenerateReport}
                        loading={loading}
                        className="h-10 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Generate Report
                    </Button>

                    <Button
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                        disabled={!pdfBlob}
                        className="h-10 px-6 rounded-xl border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300"
                    >
                        Download PDF
                    </Button>
                </div>
            </Card>

            {/* PDF Viewer */}
            <Card
                className="shadow-md border-0 rounded-2xl overflow-hidden"
                styles={{ body: { padding: 0 } }}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-slate-500">Generating report...</p>
                    </div>
                ) : pdfUrl ? (
                    <div className="w-full" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
                        <iframe
                            src={pdfUrl}
                            title="Sales Report PDF"
                            className="w-full h-full border-0"
                            style={{ borderRadius: '0 0 16px 16px' }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span className="text-slate-400">
                                    Select a date range and click "Generate Report" to view the sales breakdown
                                </span>
                            }
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ReportsRoot;
