import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Pagination, List, Empty, Modal, Button, Space } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getValidToken } from '../../api/getValidToken';
import { getServiceDocuments } from '../../api/getServiceDocuments';
import { getCompositeServiceDocument } from '../../api/getCompositeServiceDocument';
import { deleteServiceDocument } from '../../api/deleteServiceDocument';
import { searchServiceDocuments } from '../../api/searchServiceDocuments';

// Import new components
import DashboardLayout from './DashboardLayout';
import SidebarFilters from './SidebarFilters';
import HeaderBar from './HeaderBar';
import PremiumDocumentCard from './PremiumDocumentCard';

// Import utility functions
import {
    applyAllFilters,
    getOverdueDocuments,
    formatCurrency,
    mergeSearchResults
} from './helpers/utils';

const OpenRoot = () => {
    const navigate = useNavigate();
    const { message, notification } = App.useApp();

    // Data states
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [totalElements, setTotalElements] = useState(0);

    // View states
    const [viewMode, setViewMode] = useState('grid');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    // Default document type filter to 'quote'
    const [documentTypeFilter, setDocumentTypeFilter] = useState(['quote']);
    const [statusFilter, setStatusFilter] = useState([]);
    const [dateRangeFilter, setDateRangeFilter] = useState('all');
    const [customDateRange, setCustomDateRange] = useState(null);
    const [amountRange, setAmountRange] = useState([0, 100000]);
    const [overdueFilter, setOverdueFilter] = useState(false);

    // Delete modal state
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Track if overdue notifications have been shown
    const [overdueNotified, setOverdueNotified] = useState(false);

    // API search states for two-tier search
    const [isSearchingApi, setIsSearchingApi] = useState(false);
    const [apiSearchResults, setApiSearchResults] = useState([]);
    const [searchSource, setSearchSource] = useState('local'); // 'local' | 'api' | 'mixed'
    const searchTimeoutRef = useRef(null);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch documents
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const token = getValidToken();
                if (!token) {
                    setLoading(false);
                    return;
                }
                const data = await getServiceDocuments(token, currentPage, pageSize);
                const docs = data?.content || [];
                const total = data?.totalElements || 0;

                setDocuments(docs);
                setFilteredDocuments(docs);
                setTotalElements(total);
            } catch (error) {
                console.error("Failed to fetch documents", error);
                message.error("Failed to load documents.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [currentPage, pageSize, message]);

    // Helper function to check if notifications were shown recently (within 6 hours)
    const wasNotificationShownRecently = () => {
        const storedData = localStorage.getItem('overdueNotificationShown');
        if (!storedData) return false;

        try {
            const { timestamp } = JSON.parse(storedData);
            const sixHoursInMs = 6 * 60 * 60 * 1000;
            const now = Date.now();

            // Check if 6 hours have passed
            if (now - timestamp > sixHoursInMs) {
                localStorage.removeItem('overdueNotificationShown');
                return false;
            }
            return true;
        } catch {
            localStorage.removeItem('overdueNotificationShown');
            return false;
        }
    };

    // Set the notification flag in localStorage with timestamp
    const setNotificationShown = () => {
        localStorage.setItem('overdueNotificationShown', JSON.stringify({
            timestamp: Date.now()
        }));
    };

    // Show overdue notifications on page load
    useEffect(() => {
        if (documents.length > 0 && !overdueNotified && !loading) {
            // Check if notifications were already shown within 6 hours
            if (wasNotificationShownRecently()) {
                setOverdueNotified(true);
                return;
            }

            const overdueDocuments = getOverdueDocuments(documents);

            if (overdueDocuments.length > 0) {
                // Show notification for each overdue document
                overdueDocuments.forEach((doc, index) => {
                    // Stagger notifications by 500ms each for better visibility
                    setTimeout(() => {
                        notification.error({
                            message: `Overdue: ${doc.documentNumber}`,
                            description: `Customer: ${doc.customerName} | Balance Due: ${formatCurrency(doc.balanceDue)}`,
                            placement: 'topRight',
                            duration: 10,
                            style: {
                                borderLeft: '4px solid #EF4444',
                                backgroundColor: '#FEF2F2',
                            },
                        });
                    }, index * 500); // Stagger notifications by 500ms each
                });

                // Set flag in localStorage after showing notifications
                setNotificationShown();
            }

            setOverdueNotified(true);
        }
    }, [documents, overdueNotified, loading]);

    // Apply filters whenever filter states change
    useEffect(() => {
        const filters = {
            searchTerm,
            documentType: documentTypeFilter?.length > 0 ? documentTypeFilter : 'all',
            status: statusFilter?.length > 0 ? statusFilter : 'all',
            dateRange: dateRangeFilter,
            customStartDate: customDateRange?.[0]?.toDate?.() || customDateRange?.[0],
            customEndDate: customDateRange?.[1]?.toDate?.() || customDateRange?.[1],
            amountFrom: amountRange[0],
            amountTo: amountRange[1],
            overdueOnly: overdueFilter,
        };

        const localFiltered = applyAllFilters(documents, filters);

        // If we have API results and a search term, merge them
        if (searchTerm && searchTerm.trim().length >= 3 && apiSearchResults.length > 0) {
            const merged = mergeSearchResults(localFiltered, apiSearchResults);
            setFilteredDocuments(merged);
            setSearchSource(localFiltered.length > 0 ? 'mixed' : 'api');
        } else {
            setFilteredDocuments(localFiltered);
            setSearchSource('local');
        }
    }, [searchTerm, documentTypeFilter, statusFilter, dateRangeFilter, customDateRange, amountRange, overdueFilter, documents, apiSearchResults]);

    // Two-tier search: Trigger API search when local results are insufficient
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Reset API results if search term is cleared or too short
        if (!searchTerm || searchTerm.trim().length < 3) {
            setApiSearchResults([]);
            setIsSearchingApi(false);
            setSearchSource('local');
            return;
        }

        // Debounce API search by 500ms
        searchTimeoutRef.current = setTimeout(async () => {
            // Check if local results are insufficient (less than 5)
            const filters = {
                searchTerm,
                documentType: documentTypeFilter?.length > 0 ? documentTypeFilter : 'all',
                status: statusFilter?.length > 0 ? statusFilter : 'all',
                dateRange: dateRangeFilter,
                customStartDate: customDateRange?.[0]?.toDate?.() || customDateRange?.[0],
                customEndDate: customDateRange?.[1]?.toDate?.() || customDateRange?.[1],
                amountFrom: amountRange[0],
                amountTo: amountRange[1],
                overdueOnly: overdueFilter,
            };
            const localFiltered = applyAllFilters(documents, filters);

            // Only call API if local results are fewer than 5
            if (localFiltered.length < 5) {
                setIsSearchingApi(true);
                try {
                    const apiResponse = await searchServiceDocuments(searchTerm.trim(), 0, 20);
                    const apiDocs = apiResponse?.content || apiResponse || [];
                    setApiSearchResults(Array.isArray(apiDocs) ? apiDocs : []);
                } catch (error) {
                    console.error('API search failed:', error);
                    // Silently fail - local results are still shown
                    setApiSearchResults([]);
                } finally {
                    setIsSearchingApi(false);
                }
            } else {
                // Local results are sufficient, clear API results
                setApiSearchResults([]);
            }
        }, 500);

        // Cleanup timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, documents, documentTypeFilter, statusFilter, dateRangeFilter, customDateRange, amountRange, overdueFilter]);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (documentTypeFilter?.length > 0) count++;
        if (statusFilter?.length > 0) count++;
        if (dateRangeFilter && dateRangeFilter !== 'all') count++;
        if (amountRange[0] > 0 || amountRange[1] < 100000) count++;
        if (overdueFilter) count++;
        return count;
    }, [documentTypeFilter, statusFilter, dateRangeFilter, amountRange, overdueFilter]);

    // Clear all filters
    const handleClearAllFilters = useCallback(() => {
        setSearchTerm('');
        setDocumentTypeFilter([]);
        setStatusFilter([]);
        setDateRangeFilter('all');
        setCustomDateRange(null);
        setAmountRange([0, 100000]);
        setOverdueFilter(false);
    }, []);

    // Handle document click
    const handleDocumentClick = async (doc) => {
        const hide = message.loading("Loading document details...", 0);
        try {
            const compositeData = await getCompositeServiceDocument(doc.documentNumber);
            hide();
            navigate('/search-by-root', { state: { compositeData } });
        } catch (error) {
            hide();
            console.error("Failed to load composite document", error);
            message.error("Failed to open document.");
        }
    };

    // Handle delete
    const performDelete = async (doc, isHardDelete) => {
        const hide = message.loading(isHardDelete ? 'Deleting...' : 'Cancelling...', 0);
        try {
            await deleteServiceDocument(doc.documentNumber, isHardDelete);
            hide();
            message.success(isHardDelete ? 'Document deleted permanently.' : 'Document cancelled.');
            setDeleteTarget(null);

            if (isHardDelete) {
                setDocuments(prev => prev.filter(d => d.documentNumber !== doc.documentNumber));
            } else {
                setDocuments(prev => prev.map(d =>
                    d.documentNumber === doc.documentNumber ? { ...d, status: 'cancelled' } : d
                ));
            }
        } catch (error) {
            hide();
            message.error("Failed to delete document.");
        }
    };

    // Delete Confirmation Modal
    const DeleteConfirmModal = () => (
        <Modal
            title={<Space><ExclamationCircleOutlined className="text-red-500" /> Confirm Deletion</Space>}
            open={!!deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            footer={null}
        >
            <p className="mb-4 text-base">
                How would you like to delete document <b>{deleteTarget?.documentNumber}</b>?
            </p>
            <div className="flex flex-col gap-3">
                <Button
                    block
                    size="large"
                    onClick={() => performDelete(deleteTarget, false)}
                >
                    Cancel Document (Soft Delete)
                </Button>
                <div className="text-xs text-slate-400 text-center -mt-2 mb-1">Mark as cancelled, keep in database.</div>

                <Button
                    block
                    size="large"
                    danger
                    onClick={() => performDelete(deleteTarget, true)}
                >
                    Delete from Database (Hard Delete)
                </Button>
                <div className="text-xs text-slate-400 text-center -mt-2">Permanently remove records.</div>
            </div>
            <div className="text-right mt-4">
                <Button type="text" onClick={() => setDeleteTarget(null)}>Close</Button>
            </div>
        </Modal>
    );

    // Sidebar content
    const sidebarContent = (
        <SidebarFilters
            documentTypeFilter={documentTypeFilter}
            setDocumentTypeFilter={setDocumentTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            amountRange={amountRange}
            setAmountRange={setAmountRange}
            dateRangeFilter={dateRangeFilter}
            setDateRangeFilter={setDateRangeFilter}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            overdueFilter={overdueFilter}
            setOverdueFilter={setOverdueFilter}
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
        />
    );

    return (
        <DashboardLayout sidebar={sidebarContent} isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <HeaderBar
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onOpenFilters={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    isSearchingApi={isSearchingApi}
                    searchSource={searchSource}
                />

                {/* Main Content */}
                <div className="p-6">
                    {/* Results count */}
                    <div className="mb-4 text-sm text-slate-600">
                        Showing {filteredDocuments.length} of {documents.length} documents
                        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)`}
                    </div>

                    {/* Column Headers for List View */}
                    {viewMode === 'list' && filteredDocuments.length > 0 && !loading && (
                        <div className="hidden md:block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-t-lg">
                            <div className="flex items-center justify-between gap-4">
                                {/* Left side header */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="w-[16px]"></span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[110px]">Doc #</span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[80px] text-center">Type</span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[160px]">Customer</span>
                                </div>
                                {/* Right side header */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[130px]">Vehicle</span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[100px]">Date</span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[90px] text-right">Total</span>
                                    <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[90px] text-right">Balance</span>
                                    <span className="w-[32px]"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Document List */}
                    <List
                        grid={viewMode === 'grid' ? { gutter: [16, 16], column: 4, xs: 1, sm: 2, md: 3, lg: 4 } : null}
                        dataSource={filteredDocuments}
                        loading={loading}
                        locale={{
                            emptyText: (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <Empty description="No documents found" />
                                </div>
                            )
                        }}
                        renderItem={(doc) => (
                            <List.Item style={{ border: 'none', padding: viewMode === 'list' ? '0' : undefined }}>
                                <PremiumDocumentCard
                                    document={doc}
                                    onClick={handleDocumentClick}
                                    onDelete={setDeleteTarget}
                                    isListMode={viewMode === 'list'}
                                />
                            </List.Item>
                        )}
                    />

                    {/* Pagination */}
                    {!loading && totalElements > 0 && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                current={currentPage + 1}
                                pageSize={pageSize}
                                total={totalElements}
                                onChange={(page, size) => {
                                    setCurrentPage(page - 1);
                                    setPageSize(size);
                                }}
                                showSizeChanger
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} documents`}
                                pageSizeOptions={['10', '20', '50', '100']}
                            />
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmModal />
        </DashboardLayout>
    );
};

export default OpenRoot;
