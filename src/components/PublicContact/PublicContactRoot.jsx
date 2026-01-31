// src/components/PublicContact/PublicContactRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { validateSlug, submitContactForm, createServiceInquiry, decodeVin, fetchVehicleMakes, fetchVehicleModels } from '../../api/publicContactForm';
import { clearSessionId, generateSessionId } from '../../utils/sessionUtils';

// Import components
import BrandedHeader from './BrandedHeader';
import NotFoundPage from './NotFoundPage';
import PublicContactFooter from './PublicContactFooter';

// Import styles
import './PublicContact.css';

// Memoized Map component to prevent re-renders
const MapEmbed = React.memo(({ html }) => (
    <div
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: html }}
    />
));

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
    const [vinLoading, setVinLoading] = useState(false);
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

    // Options state
    const [makeOptions, setMakeOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);

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

    // Year Options (1949 - 2026)
    const yearOptions = [];
    for (let i = 2026; i >= 1949; i--) {
        yearOptions.push(i);
    }

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
                        phone: response.data.phone,
                        email: response.data.email,
                        name: response.data.name,
                        address: response.data.address,
                        alternatePhone: response.data.alternate_phone,
                        maps: response.data.maps,
                        latitude: response.data.latitude,
                        longitude: response.data.longitude
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

    // Fetch vehicle makes on mount
    useEffect(() => {
        const loadMakes = async () => {
            const makes = await fetchVehicleMakes();
            // Sort makes alphabetically
            const sortedMakes = makes.sort((a, b) =>
                (a.Make_Name || '').localeCompare(b.Make_Name || '')
            );
            setMakeOptions(sortedMakes);
        };
        loadMakes();
    }, []);

    // Fetch vehicle models when make changes
    useEffect(() => {
        const loadModels = async () => {
            if (formData.make) {
                const models = await fetchVehicleModels(formData.make);
                // Sort makes alphabetically
                const sortedModels = models.sort((a, b) =>
                    (a.Model_Name || '').localeCompare(b.Model_Name || '')
                );
                setModelOptions(sortedModels);
            } else {
                setModelOptions([]);
            }
        };
        loadModels();
    }, [formData.make]);

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
            // Split name into first and last name
            const nameParts = formData.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            // Map sub-options to affectedGlassLocation array
            let additionalGlassLocation = [];
            if (formData.serviceType === 'Window Rolling Issue') additionalGlassLocation.push(formData.windowRollingLocation);
            if (formData.serviceType === 'Vent Glass Replacement') additionalGlassLocation.push(formData.ventGlassLocation);
            if (formData.serviceType === 'Door Glass Replacement') additionalGlassLocation.push(formData.doorGlassLocation);
            if (formData.serviceType === 'Quarter Glass Replacement') additionalGlassLocation.push(formData.quarterGlassLocation);

            // Clean up potentially empty values if user switched selections
            additionalGlassLocation = additionalGlassLocation.filter(Boolean);

            const payload = {
                userId: userId, // From shop/slug validation
                firstName: firstName,
                lastName: lastName, // Fallback if no last name provided? API might require it.
                email: formData.email,
                phone: formData.phone,
                addressLine1: formData.location, // Mapping Location dropdown to addressLine1
                addressLine2: "",
                city: "", // Not captured
                state: "", // Not captured
                postalCode: "", // Not captured
                country: "", // Not captured
                vin: formData.vin,
                vehicleYear: formData.year ? parseInt(formData.year, 10) : 0,
                vehicleMake: formData.make,
                vehicleModel: formData.model,
                licensePlateNumber: "", // Not captured
                serviceType: [formData.serviceType], // API expects array
                servicePreference: formData.servicePreference === 'Mobile service' ? 'MOBILE' : 'SHOP',
                windshieldFeatures: formData.windshieldFeatures,
                affectedGlassLocation: [
                    // Map main service type to a glass location if applicable, plus specific locations
                    ...(formData.serviceType.includes('Windshield') ? ['Windshield'] : []),
                    ...additionalGlassLocation
                ],
                customerMessage: formData.message

            };

            await createServiceInquiry(payload);
            setIsSubmitted(true);

        } catch (error) {
            console.error('Form submission error:', error);
            // Optionally show error message
        } finally {
            setFormLoading(false);
        }
    };

    const handleVinLookup = async () => {
        if (!formData.vin || formData.vin.length < 17) {
            // Optional: show a toast or small error if VIN is too short
            return;
        }

        setVinLoading(true);
        try {
            const vehicleInfo = await decodeVin(formData.vin);
            if (vehicleInfo) {
                setFormData(prev => ({
                    ...prev,
                    year: vehicleInfo.ModelYear || prev.year,
                    make: vehicleInfo.Make || prev.make, // API returns uppercase usually, might need matching logic if select values differ
                    model: vehicleInfo.Model || prev.model
                }));
            }
        } catch (error) {
            console.error('VIN lookup failed:', error);
        } finally {
            setVinLoading(false);
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
        <div className="h-screen flex dot-grid-bg overflow-hidden" style={{ '--theme-color': themeColor }}>
            {/* Full Width Container */}
            <div className="flex h-full w-full max-w-7xl mx-auto items-stretch px-12 py-6 gap-8">

                {/* Left Section - Business Info */}
                <div className="w-[400px] flex-shrink-0 flex flex-col">
                    {/* Header - Using headset/support icon instead of location */}
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                            style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)` }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Contact Information</h2>
                            <p className="text-xs text-slate-500">We'd love to hear from you</p>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 mb-6">
                        {businessInfo?.name && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">Contact</p>
                                    <p className="text-sm text-slate-700 font-medium truncate">{businessInfo.name}</p>
                                </div>
                            </div>
                        )}

                        {businessInfo?.address && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">Address</p>
                                    <p className="text-sm text-slate-700 font-medium leading-tight">{businessInfo.address}</p>
                                </div>
                            </div>
                        )}

                        {(businessInfo?.phone || businessInfo?.alternatePhone) && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">Phone</p>
                                    <p className="text-sm text-slate-700 font-medium">
                                        <a href={`tel:${businessInfo.phone}`} className="hover:underline">{businessInfo.phone}</a>
                                        {businessInfo?.alternatePhone && (
                                            <span className="text-slate-400"> / <a href={`tel:${businessInfo.alternatePhone}`} className="hover:underline">{businessInfo.alternatePhone}</a></span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {businessInfo?.email && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">Email</p>
                                    <p className="text-sm text-slate-700 font-medium truncate">
                                        <a href={`mailto:${businessInfo.email}`} className="hover:underline">{businessInfo.email}</a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map Section - Takes remaining height */}
                    {businessInfo?.maps && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Our Location</p>
                            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                                <MapEmbed html={businessInfo.maps} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section - Form */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    {/* Form Container - Grows with content */}
                    <div className="flex-1 flex items-start justify-center py-2">
                        {/* Form Card - Content-based height */}
                        <div className="premium-form-card rounded-2xl p-8 w-full max-w-lg">
                            {/* Form Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-1">Get a Quote</h3>
                                <p className="text-sm text-slate-500">Fill the form below and we will get back to you shortly</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Name & Email Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="premium-label">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Smith"
                                            required
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="premium-label">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            required
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-input"
                                        />
                                    </div>
                                </div>

                                {/* Phone & Location Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="premium-label">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="(408) 565-5523"
                                            required
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="premium-label">
                                            Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="San Jose, CA"
                                            required
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-input"
                                        />
                                    </div>
                                </div>

                                {/* VIN with Lookup */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="premium-label">VIN</label>
                                        <input
                                            type="text"
                                            name="vin"
                                            value={formData.vin}
                                            onChange={handleInputChange}
                                            placeholder="1HGBH41JXMN109186"
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-input"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleVinLookup}
                                        disabled={vinLoading || !formData.vin}
                                        className="h-9 px-5 text-xs font-medium border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                        style={{
                                            borderColor: themeColor,
                                            color: themeColor,
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        {vinLoading ? '...' : 'Lookup'}
                                    </button>
                                </div>

                                {/* Year, Make, Model Row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="premium-label">Year</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-select"
                                        >
                                            <option value="">Select</option>
                                            {yearOptions.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="premium-label">Make</label>
                                        <select
                                            name="make"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-select"
                                        >
                                            <option value="">Select</option>
                                            {makeOptions.map((make) => (
                                                <option key={make.Make_ID} value={make.Make_Name}>{make.Make_Name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="premium-label">Model</label>
                                        <select
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            disabled={!formData.make}
                                            className="w-full h-9 px-3 text-sm rounded-lg premium-select disabled:opacity-50"
                                        >
                                            <option value="">Select</option>
                                            {modelOptions.map((model) => (
                                                <option key={model.Model_ID} value={model.Model_Name}>{model.Model_Name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label className="premium-label">
                                        Service Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 text-sm rounded-lg premium-select"
                                    >
                                        <option value="">Select service type</option>
                                        {serviceTypeOptions.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Conditional Service Options */}
                                {formData.serviceType === 'Windshield Replacement' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Features <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {windshieldFeatureOptions.map((feature, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input
                                                        type="checkbox"
                                                        name="windshieldFeatures"
                                                        value={feature}
                                                        checked={(formData.windshieldFeatures || []).includes(feature)}
                                                        onChange={handleCheckboxChange}
                                                        className="w-3.5 h-3.5 rounded"
                                                        style={{ accentColor: themeColor }}
                                                    />
                                                    {feature}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.serviceType === 'Window Rolling Issue' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Location <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {windowRollingOptions.map((option, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input type="radio" name="windowRollingLocation" value={option} checked={formData.windowRollingLocation === option} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.serviceType === 'Vent Glass Replacement' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Location <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {ventGlassOptions.map((option, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input type="radio" name="ventGlassLocation" value={option} checked={formData.ventGlassLocation === option} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.serviceType === 'Door Glass Replacement' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Location <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {doorGlassOptions.map((option, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input type="radio" name="doorGlassLocation" value={option} checked={formData.doorGlassLocation === option} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.serviceType === 'Quarter Glass Replacement' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Location <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {quarterGlassOptions.map((option, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input type="radio" name="quarterGlassLocation" value={option} checked={formData.quarterGlassLocation === option} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Service Preference */}
                                <div className="flex items-center gap-6 py-2">
                                    <p className="text-xs font-medium text-slate-600">Service <span className="text-red-500">*</span></p>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                            <input type="radio" name="servicePreference" value="In-shop service" checked={formData.servicePreference === 'In-shop service'} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                            In-shop
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                            <input type="radio" name="servicePreference" value="Mobile service" checked={formData.servicePreference === 'Mobile service'} onChange={handleInputChange} required className="w-3.5 h-3.5" style={{ accentColor: themeColor }} />
                                            Mobile
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="premium-btn w-full h-10 text-sm font-semibold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                                    style={{
                                        background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`
                                    }}
                                >
                                    {formLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Sending...
                                        </span>
                                    ) : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicContactRoot;


