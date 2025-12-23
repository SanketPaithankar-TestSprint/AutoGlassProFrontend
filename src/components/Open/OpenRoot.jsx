import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, message, App } from 'antd';
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
                const data = await getServiceDocuments(token);
                // API returns array directly or { data: [] }
                const docs = Array.isArray(data) ? data : (data?.data || []);

                // Sort roughly if needed, or rely on backend
                docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setDocuments(docs);
                setFilteredDocuments(docs);
            } catch (error) {
                console.error("Failed to fetch documents", error);
                message.error("Failed to load documents.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Handle Search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredDocuments(documents);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = documents.filter(doc =>
            doc.documentNumber.toLowerCase().includes(lowerTerm) ||
            doc.customerName.toLowerCase().includes(lowerTerm) ||
            doc.vehicleInfo.toLowerCase().includes(lowerTerm)
        );
        setFilteredDocuments(filtered);
    }, [searchTerm, documents]);

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

                    <SearchBar value={searchTerm} onChange={setSearchTerm} />
                </div>

                <DocumentList
                    documents={filteredDocuments}
                    loading={loading}
                    onDocumentClick={handleDocumentClick}
                />
            </div>
        </div>
    );
};

export default OpenRoot;
