// src/components/PublicContact/PublicContactRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { validateSlug, submitContactForm } from '../../api/publicContactForm';
import { clearSessionId, generateSessionId } from '../../utils/sessionUtils';

// Import components
import BrandedHeader from './BrandedHeader';
import NotFoundPage from './NotFoundPage';
import PublicContactFooter from './PublicContactFooter';

// Import styles
import './PublicContact.css';

const PublicContactRoot = () => {
    const { slug } = useParams();

    // Validation state
    const [isValidating, setIsValidating] = useState(true);
    const [isValidSlug, setIsValidSlug] = useState(false);
    const [validationError, setValidationError] = useState(null);

    // Business info state
    const [userId, setUserId] = useState(null);
    const [businessInfo, setBusinessInfo] = useState(null);

    // Form state
    const [formLoading, setFormLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        vin: '',
        year: '',
        make: '',
        model: '',
        serviceType: '',
        servicePreference: '',
        windshieldFeatures: [],
        windowRollingLocation: '',
        ventGlassLocation: '',
        doorGlassLocation: '',
        quarterGlassLocation: '',
        message: ''
    });

    // Theme color with fallback
    const themeColor = businessInfo?.themeColor || '#7E5CFE';

    // Apply theme color to CSS custom property
    useEffect(() => {
        if (themeColor) {
            document.documentElement.style.setProperty('--theme-color', themeColor);
        }
    }, [themeColor]);

    // Service Type Options
    // Service Type Options
    const serviceTypeOptions = [
        'Windshield Replacement',
        'Door Glass Replacement',
        'Vent Glass Replacement',
        'Quarter Glass Replacement',
        'Back Glass Replacement',
        'Sunroof Glass Replacement',
        'Windshield Chip repair',
        'Window Rolling Issue'
    ];

    // Windshield Features Options
    const windshieldFeatureOptions = [
        'Rain Sensor',
        'No Sensor',
        'Lane Departure Warning',
        'Condensation Sensor',
        'Humidity Sensor',
        'Forward Collision Sensor',
        'Headsup Display'
    ];

    // Window Rolling Options
    const windowRollingOptions = [
        'Front Left Door',
        'Rear Left Door',
        'Front Right Door',
        'Rear Right Door'
    ];

    // Vent Glass Options
    const ventGlassOptions = [
        'Front Left Vent Glass',
        'Rear Left Vent Glass',
        'Front Right Vent Glass',
        'Rear Right Vent Glass'
    ];

    // Door Glass Options (same as Window Rolling)
    const doorGlassOptions = [
        'Front Left Door',
        'Rear Left Door',
        'Front Right Door',
        'Rear Right Door'
    ];

    // Quarter Glass Options
    const quarterGlassOptions = [
        'Front Left Quarter Glass',
        'Rear Left Quarter Glass',
        'Front Right Quarter Glass',
        'Rear Right Quarter Glass'
    ];

    // Validate slug on mount
    useEffect(() => {
        const validateBusinessSlug = async () => {
            if (!slug) {
                setIsValidating(false);
                setIsValidSlug(false);
                return;
            }

            try {
                setIsValidating(true);
                const response = await validateSlug(slug);

                if (response.valid && response.data) {
                    setIsValidSlug(true);
                    setUserId(response.data.user_id);
                    setBusinessInfo({
                        id: response.data.id,
                        slug: response.data.slug,
                        businessName: response.data.business_name,
                        themeColor: response.data.theme_color,
                        tagline: response.data.tagline,
                        logoUrl: response.data.logo_url,
                        phone: response.data.phone, // Assuming phone might be available
                        email: response.data.email  // Assuming email might be available
                    });
                } else {
                    setIsValidSlug(false);
                    setValidationError(response.message || 'Invalid business slug');
                }
            } catch (error) {
                console.error('Slug validation error:', error);
                setIsValidSlug(false);
                setValidationError('Failed to validate business');
            } finally {
                setIsValidating(false);
            }
        };

        validateBusinessSlug();
    }, [slug]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentFeatures = prev.windshieldFeatures || [];
            if (checked) {
                return { ...prev, windshieldFeatures: [...currentFeatures, value] };
            } else {
                return { ...prev, windshieldFeatures: currentFeatures.filter(item => item !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Generate a session ID for tracking this submission
            const sessionId = generateSessionId();

            await submitContactForm(formData, sessionId, userId);
            setIsSubmitted(true);
            clearSessionId(slug); // Clear any old sessions
        } catch (error) {
            console.error('Form submission error:', error);
            // Optionally show error message
        } finally {
            setFormLoading(false);
        }
    };

    const handleNewMessage = () => {
        setIsSubmitted(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            location: '',
            vin: '',
            year: '',
            make: '',
            model: '',
            serviceType: '',
            servicePreference: '',
            windshieldFeatures: [],
            windowRollingLocation: '',
            ventGlassLocation: '',
            quarterGlassLocation: '',
            doorGlassLocation: '',
            message: ''
        });
    };

    // Loading state
    if (isValidating) {
        return (
            <div className="public-contact-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    // Invalid slug
    if (!isValidSlug) {
        return <NotFoundPage />;
    }

    // Success Screen
    if (isSubmitted) {
        return (
            <div className="public-contact-page" style={{ '--theme-color': themeColor }}>
                <BrandedHeader
                    businessName={businessInfo?.businessName}
                    logoUrl={businessInfo?.logoUrl}
                    tagline={businessInfo?.tagline}
                    themeColor={themeColor}
                />
                <div className="completion-screen">
                    <div className="completion-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 className="completion-title">Message Sent!</h2>
                    <p className="completion-subtitle">Thank you for contacting {businessInfo?.businessName}. We will get back to you shortly.</p>

                    <button className="new-inquiry-btn" onClick={handleNewMessage}>
                        Send Another Message
                    </button>
                </div>
                <PublicContactFooter />
            </div>
        );
    }

    // Main Contact Form
    return (
        <div className="public-contact-page" style={{ '--theme-color': themeColor }}>
            <BrandedHeader
                businessName={businessInfo?.businessName}
                logoUrl={businessInfo?.logoUrl}
                tagline={businessInfo?.tagline}
                themeColor={themeColor}
            />

            <div className="contact-form-container">
                <div className="contact-card">
                    {/* Removed Get in Touch header to match style more closely if needed, 
                        but keeping it for structure as per previous layout, or I can make it simpler.
                        The example image has fields directly. I will keep the header for branded feel but simplify. */}

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email <span className="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="(408) 565-5523"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location <span className="required">*</span></label>
                                <select
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input form-select"
                                >
                                    <option value="">-Select-</option>
                                    <option value="Main Service Area">Main Service Area</option>
                                    {/* Add more options if available dynamically */}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="vin">VIN</label>
                            <input
                                type="text"
                                id="vin"
                                name="vin"
                                value={formData.vin}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        {/* Lookup Button (Visual only as per instructions) */}
                        <div className="form-group">
                            <button type="button" className="lookup-btn" disabled>
                                Lookup Vehicle Info
                            </button>
                        </div>

                        <div className="form-row three-col">
                            <div className="form-group">
                                <label htmlFor="year">Year</label>
                                {/* Image shows dropdown for Year, but user said keep as text field. 
                                     I'll use text input to strictly follow 'keep them as text fields'. 
                                     Actually, usually Year is a dropdown. But user said "text fields". 
                                     I will use text to be safe with the instruction. */}
                                <input
                                    type="text"
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    placeholder=""
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="make">Make</label>
                                <input
                                    type="text"
                                    id="make"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="model">Model</label>
                                <input
                                    type="text"
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="serviceType">What type of service you are looking for? <span className="required">*</span></label>
                            <select
                                id="serviceType"
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleInputChange}
                                required
                                className="form-input form-select"
                            >
                                <option value="">- Select -</option>
                                {serviceTypeOptions.map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {formData.serviceType === 'Windshield Replacement' && (
                            <div className="form-group animate-fade-in">
                                <label className="radio-label">Windshield Replacement <span className="required">*</span></label>
                                <div className="checkbox-group">
                                    {windshieldFeatureOptions.map((feature, idx) => (
                                        <label key={idx} className="checkbox-option">
                                            <input
                                                type="checkbox"
                                                name="windshieldFeatures"
                                                value={feature}
                                                checked={(formData.windshieldFeatures || []).includes(feature)}
                                                onChange={handleCheckboxChange}
                                            />
                                            {feature}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.serviceType === 'Window Rolling Issue' && (
                            <div className="form-group animate-fade-in">
                                <label className="radio-label">Window Rolling Issue <span className="required">*</span></label>
                                <div className="radio-group">
                                    {windowRollingOptions.map((option, idx) => (
                                        <label key={idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="windowRollingLocation"
                                                value={option}
                                                checked={formData.windowRollingLocation === option}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.serviceType === 'Vent Glass Replacement' && (
                            <div className="form-group animate-fade-in">
                                <label className="radio-label">Vent Glass Replacement <span className="required">*</span></label>
                                <div className="radio-group">
                                    {ventGlassOptions.map((option, idx) => (
                                        <label key={idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="ventGlassLocation"
                                                value={option}
                                                checked={formData.ventGlassLocation === option}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.serviceType === 'Door Glass Replacement' && (
                            <div className="form-group animate-fade-in">
                                <label className="radio-label">Door Glass Replacement <span className="required">*</span></label>
                                <div className="radio-group">
                                    {doorGlassOptions.map((option, idx) => (
                                        <label key={idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="doorGlassLocation"
                                                value={option}
                                                checked={formData.doorGlassLocation === option}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.serviceType === 'Quarter Glass Replacement' && (
                            <div className="form-group animate-fade-in">
                                <label className="radio-label">Quarter Glass Replacement <span className="required">*</span></label>
                                <div className="radio-group">
                                    {quarterGlassOptions.map((option, idx) => (
                                        <label key={idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="quarterGlassLocation"
                                                value={option}
                                                checked={formData.quarterGlassLocation === option}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="radio-label">Type of service <span className="required">*</span></label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="servicePreference"
                                        value="In-shop service"
                                        checked={formData.servicePreference === 'In-shop service'}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    In-shop service
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="servicePreference"
                                        value="Mobile service"
                                        checked={formData.servicePreference === 'Mobile service'}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    Mobile service
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn full-width-btn"
                            disabled={formLoading}
                        >
                            {formLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Sending...
                                </span>
                            ) : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>

            <PublicContactFooter />
        </div>
    );
};

export default PublicContactRoot;
