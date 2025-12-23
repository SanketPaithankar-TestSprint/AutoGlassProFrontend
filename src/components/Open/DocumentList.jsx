import React from 'react';
import { Empty } from 'antd';
import DocumentCard from './DocumentCard';

const DocumentList = ({ documents, loading, onDocumentClick }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-slate-100 p-4">
                        <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                        <div className="h-3 bg-slate-100 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/3 mb-6"></div>
                        <div className="h-8 bg-slate-100 rounded w-full mt-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Empty description="No documents found" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
                <DocumentCard
                    key={doc.documentNumber}
                    document={doc}
                    onClick={onDocumentClick}
                />
            ))}
        </div>
    );
};

export default DocumentList;
