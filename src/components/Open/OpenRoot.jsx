import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, message, App, Pagination, List, Segmented, Card, Tag, Empty, Modal, Button, Space, Tooltip } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, FileTextOutlined, UserOutlined, CarOutlined, CalendarOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Header from '../Header';
import SearchBar from './SearchBar';
import { getValidToken } from '../../api/getValidToken';
import { getServiceDocuments } from '../../api/getServiceDocuments';
import { getCompositeServiceDocument } from '../../api/getCompositeServiceDocument';
import { deleteServiceDocument } from '../../api/deleteServiceDocument';

const { Content } = Layout;

const OpenRoot = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [documentTypeFilter, setDocumentTypeFilter] = useState("all"); // New filter state
    const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const { message, modal } = App.useApp(); // Use App context for messages and modal

    // Fetch API Data
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const token = getValidToken();
                if (!token) {
                    setLoading(false);
                    return; // Or redirect
                }
                const data = await getServiceDocuments(token, currentPage, pageSize);
                // API returns paginated response: { content: [], totalElements: 0, ... }
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
    }, [currentPage, pageSize]);

    // Handle Search and Filter
    useEffect(() => {
        let filtered = documents;

        // Filter by search term
        if (searchTerm.trim()) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(doc =>
                doc.documentNumber.toLowerCase().includes(lowerTerm) ||
                doc.customerName.toLowerCase().includes(lowerTerm) ||
                doc.vehicleInfo.toLowerCase().includes(lowerTerm)
            );
        }

        // Filter by document type
        if (documentTypeFilter !== "all") {
            filtered = filtered.filter(doc => {
                const docType = doc.documentType?.toLowerCase();
                return docType === documentTypeFilter.toLowerCase();
            });
        }

        setFilteredDocuments(filtered);
    }, [searchTerm, documentTypeFilter, documents]);

    // Handle Document Click (Fetch Full Details & Navigate)
    const handleDocumentClick = async (doc) => {
        const hide = message.loading("Loading document details...", 0);
        try {
            // Fetch full composite data
            const compositeData = await getCompositeServiceDocument(doc.documentNumber);
            hide();
            navigate('/search-by-root', { state: { compositeData } });
        } catch (error) {
            hide();
            console.error("Failed to load composite document", error);
            message.error("Failed to open document.");
        }
    };



    // Actually, let's use a simpler approach: Standard confirm for "Cancel vs Delete" is hard with 2 buttons.
    // Let's implement a wrapper function that uses Modal.confirm for the *action*.
    // OR create a custom component. 
    // Let's stick to a custom implementation inside render for reliability.

    // We will use a separate function to show a custom modal content with 3 buttons?
    // Antd Modal.confirm doesn't easily support 3 distinct exits (Cancel, Soft, Hard).
    // Let's use `modal.info` or `modal.warning` with custom content that wraps the buttons?
    // Or just use a local state `deleteTarget` and render a <Modal> component. --> This is safer.

    const [deleteTarget, setDeleteTarget] = useState(null);

    const performDelete = async (doc, isHardDelete) => {
        const hide = message.loading(isHardDelete ? 'Deleting...' : 'Cancelling...', 0);
        try {
            await deleteServiceDocument(doc.documentNumber, isHardDelete);
            hide();
            message.success(isHardDelete ? 'Document deleted permanently.' : 'Document cancelled.');
            setDeleteTarget(null);
            // Refresh list
            // Refresh list
            if (isHardDelete) {
                setDocuments(prev => prev.filter(d => d.documentNumber !== doc.documentNumber));
                setFilteredDocuments(prev => prev.filter(d => d.documentNumber !== doc.documentNumber));
            } else {
                // Soft delete - update status to 'cancelled' locally
                setDocuments(prev => prev.map(d => d.documentNumber === doc.documentNumber ? { ...d, status: 'cancelled' } : d));
                setFilteredDocuments(prev => prev.map(d => d.documentNumber === doc.documentNumber ? { ...d, status: 'cancelled' } : d));
            }
        } catch (error) {
            hide();
            message.error("Failed to delete document.");
        }
    };

    // Helper functions for colors
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
            case 'workorder': return 'orange';
            case 'invoice': return 'cyan';
            default: return 'default';
        }
    };

    // Render document card (grid view)
    const renderDocumentCard = (doc) => {
        const { documentNumber, documentType, status, customerName, vehicleInfo, totalAmount, createdAt } = doc;

        // List view - horizontal layout with headers
        if (viewMode === 'list') {
            return (
                <div
                    onClick={() => handleDocumentClick(doc)}
                    className="w-full cursor-pointer hover:bg-slate-50 transition-colors p-4 border border-slate-200 rounded-lg mb-2"
                >
                    <div className="flex items-center justify-between gap-4">
                        {/* Left side - ID, Type, Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileTextOutlined className="text-slate-600 text-base flex-shrink-0" />
                            <span className="font-bold text-slate-900 text-sm whitespace-nowrap w-[110px]">{documentNumber}</span>
                            <Tag color={getTypeColor(documentType)} className="uppercase font-bold text-[10px] m-0 flex-shrink-0 w-[80px] text-center">
                                {documentType?.replace('_', ' ')}
                            </Tag>
                            <div className="flex items-center gap-2 text-slate-600 text-sm min-w-0 w-[160px]">
                                <UserOutlined className="text-slate-400 flex-shrink-0" />
                                <span className="truncate">{customerName}</span>
                            </div>
                        </div>

                        {/* Right side - Vehicle, Date, Total, Balance */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center gap-2 text-slate-600 text-sm w-[130px]">
                                <CarOutlined className="text-slate-400" />
                                <span className="whitespace-nowrap truncate">{vehicleInfo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 text-sm w-[100px]">
                                <CalendarOutlined className="text-slate-400" />
                                <span className="whitespace-nowrap">{new Date(createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="font-bold text-slate-900 text-sm whitespace-nowrap w-[90px] text-right">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount || 0)}
                            </span>
                            <span className="font-medium text-amber-600 text-sm whitespace-nowrap w-[90px] text-right">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(doc.balanceDue || 0)}
                            </span>
                            <Tooltip title="Delete Document">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget(doc);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            );
        }

        // Grid view - card layout
        return (
            <Card
                hoverable
                onClick={() => handleDocumentClick(doc)}
                className="w-full transition-all duration-300 hover:shadow-lg border border-slate-200 rounded-xl"
                bodyStyle={{ padding: '16px' }}
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
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Total</span>
                        <span className="font-bold text-slate-900 text-base">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount || 0)}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500">Balance</span>
                        <span className="font-medium text-amber-600 text-base">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(doc.balanceDue || 0)}
                        </span>
                    </div>
                    <Tooltip title="Delete Document">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(doc);
                            }}
                        />
                    </Tooltip>
                </div>
            </Card>
        );
    };

    // End of renderDocumentCard


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

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage and track your service documents.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* View Mode Toggle */}
                        <Segmented
                            value={viewMode}
                            onChange={setViewMode}
                            options={[
                                {
                                    label: 'Grid',
                                    value: 'grid',
                                    icon: <AppstoreOutlined />,
                                },
                                {
                                    label: 'List',
                                    value: 'list',
                                    icon: <UnorderedListOutlined />,
                                },
                            ]}
                        />

                        {/* Document Type Filter */}
                        <select
                            value={documentTypeFilter}
                            onChange={(e) => setDocumentTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-slate-700"
                        >
                            <option value="all">All Documents</option>
                            <option value="quote">Quote</option>
                            <option value="invoice">Invoice</option>
                            <option value="work_order">Work Order</option>
                        </select>

                        {/* Search Bar */}
                        <SearchBar value={searchTerm} onChange={setSearchTerm} />
                    </div>
                </div>

                {/* Column Headers for List View */}
                {viewMode === 'list' && filteredDocuments.length > 0 && !loading && (
                    <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-t-lg mb-0">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left side headers */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="w-[16px]"></span> {/* Icon spacer */}
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[110px]">Doc #</span>
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[80px] text-center">Type</span>
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[160px]">Name</span>
                            </div>
                            {/* Right side headers */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[130px]">Vehicle</span>
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[100px]">Date</span>
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[90px] text-right">Total</span>
                                <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-[90px] text-right">Balance</span>
                                <span className="w-[32px]"></span> {/* Action button spacer */}
                            </div>
                        </div>
                    </div>
                )}

                {/* Document List with Ant Design */}
                <List
                    grid={viewMode === 'grid' ? { gutter: 16, column: 4, xs: 1, sm: 2, md: 3, lg: 4 } : null}
                    dataSource={filteredDocuments}
                    loading={loading}
                    locale={{
                        emptyText: (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Empty description="No documents found" />
                            </div>
                        )
                    }}
                    renderItem={(doc) => (
                        <List.Item style={{ border: 'none' }}>
                            {renderDocumentCard(doc)}
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
            <DeleteConfirmModal />
        </div>
    );
};

export default OpenRoot;
