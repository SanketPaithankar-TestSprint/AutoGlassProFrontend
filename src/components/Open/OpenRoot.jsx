import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, message, App, Pagination } from 'antd';
import Header from '../Header';
import SearchBar from './SearchBar';
import DocumentList from './DocumentList';
import { getValidToken } from '../../api/getValidToken';
import { getServiceDocuments } from '../../api/getServiceDocuments';
import { getCompositeServiceDocument } from '../../api/getCompositeServiceDocument';

const { Content } = Layout;

const OpenRoot = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [documentTypeFilter, setDocumentTypeFilter] = useState("all"); // New filter state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const { message } = App.useApp(); // Use App context for messages if possible, or standard message

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

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage and track your service documents.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Document Type Filter */}
                        <select
                            value={documentTypeFilter}
                            onChange={(e) => setDocumentTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-slate-700"
                        >
                            <option value="all">All Documents</option>
                            <option value="quote">Quote</option>
                            <option value="invoice">Invoice</option>
                            <option value="workorder">Work Order</option>
                        </select>

                        {/* Search Bar */}
                        <SearchBar value={searchTerm} onChange={setSearchTerm} />
                    </div>
                </div>

                <DocumentList
                    documents={filteredDocuments}
                    loading={loading}
                    onDocumentClick={handleDocumentClick}
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
    );
};

export default OpenRoot;
