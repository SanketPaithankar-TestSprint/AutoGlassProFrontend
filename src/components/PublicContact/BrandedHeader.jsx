// src/components/PublicContact/BrandedHeader.jsx
import React from 'react';

const BrandedHeader = ({ businessName, logoUrl, tagline, themeColor }) => {
    // Get initials for placeholder
    const getInitials = (name) => {
        if (!name) return 'AG';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="branded-header">
            <div className="branded-header-content">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={`${businessName} logo`}
                        className="business-logo"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="business-logo-placeholder"
                    style={{
                        display: logoUrl ? 'none' : 'flex',
                        background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
                    }}
                >
                    {getInitials(businessName)}
                </div>
                <div className="business-info">
                    <h1>{businessName || 'Auto Glass Pro'}</h1>
                    <p className="tagline">{tagline || 'Get Your Free Quote'}</p>
                </div>
            </div>
        </header>
    );
};

export default BrandedHeader;
