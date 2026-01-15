// src/components/PublicContact/PublicContactFooter.jsx
import React from 'react';

const PublicContactFooter = () => {
    return (
        <footer className="public-contact-footer">
            <div className="footer-content">
                <div className="powered-by">
                    <span>Powered by</span>
                    <strong>APAI</strong>
                </div>
                <div>
                    <a href="/privacy">Privacy Policy</a>
                    <span>•</span>
                    <a href="/terms">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default PublicContactFooter;
