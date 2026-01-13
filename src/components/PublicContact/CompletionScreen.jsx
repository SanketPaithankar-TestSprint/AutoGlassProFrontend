// src/components/PublicContact/CompletionScreen.jsx
import React from 'react';

const CompletionScreen = ({ businessName, collectedData, onNewInquiry, themeColor }) => {
    // Debug log to see what data we're receiving
    console.log('CompletionScreen - collectedData:', collectedData);

    // Get customer_info object
    const customerInfo = collectedData?.customer_info || {};

    // Helper to get full name (combines first_name and last_name)
    const getName = () => {
        const firstName = customerInfo.first_name || '';
        const lastName = customerInfo.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || 'Not provided';
    };

    // Helper to get email
    const getEmail = () => {
        return customerInfo.email || 'Not provided';
    };

    // Helper to get phone
    const getPhone = () => {
        return customerInfo.phone || 'Not provided';
    };

    // Helper to get address
    const getAddress = () => {
        const parts = [
            customerInfo.addr_line_1,
            customerInfo.addr_line_2,
            customerInfo.city,
            customerInfo.state,
            customerInfo.postal_code,
            customerInfo.country
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : null;
    };

    // Helper to format vehicle info
    const getVehicleInfo = () => {
        if (!collectedData) return 'Not provided';

        // Use the exact field names from the API response
        const year = collectedData.year;
        const make = collectedData.make_name;
        const model = collectedData.model_name;
        const bodyStyle = collectedData.body_style_name;

        const parts = [year, make, model, bodyStyle].filter(Boolean);

        return parts.length > 0 ? parts.join(' ') : 'Not provided';
    };

    // Helper to format glass selection
    const getGlassInfo = () => {
        if (!collectedData) return 'Not specified';

        const { selected_glasses } = collectedData;

        // Handle selected_glasses array with glass_type property
        if (selected_glasses && Array.isArray(selected_glasses) && selected_glasses.length > 0) {
            return selected_glasses.map(g => g.glass_type || g.name || g.desc || g).join(', ');
        }

        return 'Not specified';
    };

    return (
        <div className="completion-screen">
            <div className="completion-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>

            <h2 className="completion-title">Thank You for Your Inquiry!</h2>
            <p className="completion-subtitle">
                We've received your information and {businessName || 'we'} will contact you shortly with your quote.
            </p>

            <div className="completion-summary">
                <h3 className="summary-title">Summary</h3>

                <div className="summary-row">
                    <span className="summary-label">Name</span>
                    <span className="summary-value">{getName()}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Email</span>
                    <span className="summary-value">{getEmail()}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Phone</span>
                    <span className="summary-value">{getPhone()}</span>
                </div>

                {getAddress() && (
                    <div className="summary-row">
                        <span className="summary-label">Address</span>
                        <span className="summary-value">{getAddress()}</span>
                    </div>
                )}

                <div className="summary-row">
                    <span className="summary-label">Vehicle</span>
                    <span className="summary-value">{getVehicleInfo()}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Glass Needed</span>
                    <span className="summary-value">{getGlassInfo()}</span>
                </div>
            </div>

            <button
                className="new-inquiry-btn"
                onClick={onNewInquiry}
                style={{ backgroundColor: themeColor }}
            >
                Submit Another Inquiry
            </button>
        </div>
    );
};

export default CompletionScreen;
