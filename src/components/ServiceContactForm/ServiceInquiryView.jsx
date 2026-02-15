import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InquiryDetails from './InquiryDetails';

const ServiceInquiryView = () => {
    const { id } = useParams();

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <InquiryDetails inquiryId={id} />
            </div>
        </div>
    );
};

export default ServiceInquiryView;
