import React from 'react';
import { useParams } from 'react-router-dom';
import InquiryDetails from './InquiryDetails';
import useInquiryDetails from './hooks/useInquiryDetails';

const ServiceInquiryView = () => {
    const { id } = useParams();
    const { inquiry, loading, error } = useInquiryDetails(id);

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
                <div className="text-gray-500 text-lg">Loading Inquiry...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="bg-red-50 text-red-600 p-6 rounded-md shadow-md border border-red-100 max-w-lg text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <InquiryDetails inquiry={inquiry} />
            </div>
        </div>
    );
};

export default ServiceInquiryView;
