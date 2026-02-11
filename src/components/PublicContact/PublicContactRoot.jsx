// src/components/PublicContact/PublicContactRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { validateSlug, submitContactForm, createServiceInquiry, decodeVin, fetchVehicleMakes, fetchVehicleModels } from '../../api/publicContactForm';
import { clearSessionId, generateSessionId } from '../../utils/sessionUtils';

// Import components
import BrandedHeader from './BrandedHeader';
import NotFoundPage from './NotFoundPage';
import PublicContactFooter from './PublicContactFooter';

// Import styles
import './PublicContact.css';

// Import Assets
import carPreview from '../../assets/car_preview.png';
import { GLASS_OVERLAYS } from './const/imageConfig';
// Memoized Map component to prevent re-renders
const MapEmbed = React.memo(({ html }) => (
    <div
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: html }}
    />
));

const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');

    // Check for 11 digits (1 + 10 digits) - remove leading 1
    const match11 = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match11) {
        return `(${match11[1]}) ${match11[2]}-${match11[3]}`;
    }

    // Check for 10 digits
    const match10 = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match10) {
        return `(${match10[1]}) ${match10[2]}-${match10[3]}`;
    }

    return phoneNumber;
};



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
    const [showNote, setShowNote] = useState(false);
    const [fileList, setFileList] = useState([]);
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
        message: '',
        street: '',
        city: '',
        zipcode: ''
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
        let finalValue = value;

        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length === 0) {
                finalValue = '';
            } else if (cleaned.length <= 3) {
                finalValue = `(${cleaned}`;
            } else if (cleaned.length <= 6) {
                finalValue = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
            } else {
                finalValue = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
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

    const isMobile = formData.servicePreference === 'Mobile service';

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

            const jsonPayload = {
                userId: userId, // From shop/slug validation
                firstName: firstName,
                lastName: lastName, // Fallback if no last name provided? API might require it.
                email: formData.email,
                phone: formData.phone,
                addressLine1: formData.location, // Send location input in addressLine1
                addressLine2: isMobile ? formData.street : "", // Send street for mobile only, empty for shop
                city: isMobile ? formData.city : "", // Not captured
                state: "", // Not captured
                postalCode: isMobile ? formData.zipcode : "", // Not captured
                country: "", // Not captured
                vin: formData.vin,
                vehicleYear: formData.year ? parseInt(formData.year, 10) : 0,
                vehicleMake: formData.make,
                vehicleModel: formData.model,
                licensePlateNumber: "", // Not captured
                serviceType: [formData.serviceType], // API expects array
                servicePreference: formData.servicePreference === 'Mobile service' ? 'MOBILE' : 'IN_SHOP',
                windshieldFeatures: formData.windshieldFeatures,
                affectedGlassLocation: [
                    // Map main service type to a glass location if applicable, plus specific locations
                    ...(formData.serviceType.includes('Windshield') ? ['Windshield'] : []),
                    ...additionalGlassLocation
                ],
                customerMessage: formData.message
            };

            const payload = new FormData();
            payload.append('data', JSON.stringify(jsonPayload));

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    payload.append('files', file.originFileObj);
                }
            });

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
        setFileList([]);
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
            message: '',
            street: '',
            city: '',
            zipcode: ''
        });
    };

    // Helper to check if shop is open (Simple placeholder logic)
    const isShopOpen = () => {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        // Example: Open Mon-Fri, 9am - 6pm
        return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
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
        <div
            className="min-h-screen lg:h-screen flex flex-col relative lg:overflow-hidden"
            style={{
                '--theme-color': themeColor,
                background: `linear-gradient(135deg, ${themeColor}26 0%, #ffffff 50%, ${themeColor}12 100%)`
            }}
        >
            {/* Full Width Container */}
            <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl mx-auto items-stretch px-4 md:px-8 lg:px-12 py-4 lg:py-6 gap-6 lg:gap-8">

                {/* Left Column - Form Section */}
                <div className="w-full lg:w-5/12 order-2 lg:order-1 flex flex-col min-h-0 lg:h-full pr-2 py-2">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="premium-form-card rounded-2xl p-8 w-full min-h-full h-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-1">Get a Quote</h3>
                                <p className="text-sm text-slate-500">Fill the form below and we will get back to you shortly</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Name & Email Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="premium-label">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                    </div>
                                    <div>
                                        <label className="premium-label">Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@address.com" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                    </div>
                                </div>

                                {/* Phone & Location Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="premium-label">Phone <span className="text-red-500">*</span></label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 555-5555" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                    </div>
                                    <div>
                                        <label className="premium-label">Location {!isMobile && <span className="text-red-500">*</span>}</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, State" required={!isMobile} className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                    </div>
                                </div>

                                {/* VIN with Lookup */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="premium-label">VIN</label>
                                        <input type="text" name="vin" value={formData.vin} onChange={handleInputChange} placeholder="Enter 17-character VIN" className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                    </div>
                                    <button type="button" onClick={handleVinLookup} disabled={vinLoading || !formData.vin} className="h-9 px-5 text-xs font-medium border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm" style={{ borderColor: themeColor, color: themeColor, backgroundColor: 'white' }}>
                                        {vinLoading ? '...' : 'Lookup'}
                                    </button>
                                </div>

                                {/* Year, Make, Model Row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="premium-label">Year</label>
                                        <Select
                                            showSearch
                                            placeholder="Select"
                                            optionFilterProp="children"
                                            value={formData.year || undefined}
                                            onChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                            className="w-full"
                                            style={{ height: '36px' }}
                                            dropdownStyle={{ zIndex: 9999 }}
                                        >
                                            {yearOptions.map(year => (
                                                <Select.Option key={year} value={year}>{year}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="premium-label">Make</label>
                                        <Select
                                            showSearch
                                            placeholder="Select"
                                            optionFilterProp="children"
                                            value={formData.make || undefined}
                                            onChange={(value) => setFormData(prev => ({ ...prev, make: value, model: '' }))}
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            className="w-full"
                                            style={{ height: '36px' }}
                                            dropdownStyle={{ zIndex: 9999 }}
                                        >
                                            {makeOptions.map((make) => (
                                                <Select.Option key={make.Make_ID} value={make.Make_Name}>{make.Make_Name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="premium-label">Model</label>
                                        <Select
                                            showSearch
                                            placeholder="Select"
                                            optionFilterProp="children"
                                            value={formData.model || undefined}
                                            onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                                            disabled={!formData.make}
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            className="w-full"
                                            style={{ height: '36px' }}
                                            dropdownStyle={{ zIndex: 9999 }}
                                        >
                                            {modelOptions.map((model) => (
                                                <Select.Option key={model.Model_ID} value={model.Model_Name}>{model.Model_Name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label className="premium-label">Service Type <span className="text-red-500">*</span></label>
                                    <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} required className="w-full h-9 px-3 text-sm rounded-lg premium-select">
                                        <option value="">Select service type</option>
                                        {serviceTypeOptions.map((opt, idx) => (<option key={idx} value={opt}>{opt}</option>))}
                                    </select>
                                </div>

                                {/* Conditional Service Options */}
                                {formData.serviceType === 'Windshield Replacement' && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Features <span className="text-red-500">*</span></p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {windshieldFeatureOptions.map((feature, idx) => (
                                                <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-1">
                                                    <input type="checkbox" name="windshieldFeatures" value={feature} checked={(formData.windshieldFeatures || []).includes(feature)} onChange={handleCheckboxChange} className="w-3.5 h-3.5 rounded" style={{ accentColor: themeColor }} />
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

                                {isMobile && (
                                    <div className="animate-fadeIn space-y-3 pt-2">
                                        <div>
                                            <label className="premium-label">Street Address <span className="text-red-500">*</span></label>
                                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="123 Main St" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="premium-label">City <span className="text-red-500">*</span></label>
                                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="San Jose" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                            </div>
                                            <div>
                                                <label className="premium-label">Zip Code <span className="text-red-500">*</span></label>
                                                <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} placeholder="95112" required className="w-full h-9 px-3 text-sm rounded-lg premium-input" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Notes Toggle */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-2">
                                        <input
                                            type="checkbox"
                                            checked={showNote}
                                            onChange={(e) => {
                                                setShowNote(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormData(prev => ({ ...prev, message: '' }));
                                                }
                                            }}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                            style={{ accentColor: themeColor }}
                                        />
                                        <span>Add Details/Notes</span>
                                    </label>

                                    {showNote && (
                                        <div className="animate-fadeIn">
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                placeholder="Any additional details..."
                                                className="w-full px-3 py-2 text-sm rounded-lg premium-input h-24 resize-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="premium-label">Upload Images (Optional)</label>
                                    <Upload
                                        beforeUpload={() => false}
                                        fileList={fileList}
                                        onChange={({ fileList }) => setFileList(fileList)}
                                        listType="picture"
                                        maxCount={5}
                                        multiple
                                    >
                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                    </Upload>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center mt-4">
                                    <button type="submit" disabled={formLoading} className="premium-btn h-10 text-sm font-semibold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed px-8" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)` }}>
                                        {formLoading ? (<span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Sending...</span>) : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column - Info & Glass Reference */}
                <div className="w-full lg:w-7/12 order-1 lg:order-2 flex flex-col gap-4 lg:h-full lg:overflow-hidden pt-2 pb-2">

                    {/* Card 1: Shop Info & Map Combined */}
                    {/* Card 1: Shop Info & Map Combined */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 flex-1 min-h-0">
                        {/* Main Content Area - Responsive Flex */}
                        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

                            {/* Info Column */}
                            <div className="flex flex-col w-full md:w-3/5 min-h-0 overflow-hidden">
                                {/* Header Section */}
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'white', color: themeColor }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold text-slate-800 truncate leading-tight">{businessInfo?.businessName || "Our Location"}</h2>
                                            {businessInfo?.tagline && (
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{businessInfo.tagline}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info - Scrollable */}
                                <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 custom-scrollbar">

                                    {/* Phone Row */}
                                    {businessInfo?.phone && (
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-medium text-slate-500 mb-0.5">Phone</p>
                                                <a href={`tel:${businessInfo.phone}`} className="text-base font-semibold text-slate-800 hover:text-blue-600 transition-colors block">
                                                    {formatPhoneNumber(businessInfo.phone)}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Row */}
                                    {businessInfo?.address && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-medium text-slate-500 mb-0.5">Address</p>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.address)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-slate-800 leading-snug hover:text-blue-600 transition-colors block"
                                                >
                                                    {businessInfo.address}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Row */}
                                    {businessInfo?.email && (
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-medium text-slate-500 mb-0.5">Email</p>
                                                <a href={`mailto:${businessInfo.email}`} className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors block truncate">
                                                    {businessInfo.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map Column */}
                            {businessInfo?.maps && (
                                <div className="relative w-full h-48 md:w-2/5 md:h-auto border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50">
                                    <MapEmbed html={businessInfo.maps} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Glass Reference - Takes ~50% height */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center flex-shrink-0 flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden relative group">
                        {/* Fixed size container on md and lg screens, responsive on smaller screens */}
                        <div
                            className="relative flex items-center justify-center flex-shrink-0 w-full md:w-80 lg:w-96"
                            style={{
                                aspectRatio: '3/4',
                                position: 'relative',
                            }}
                        >
                            <img
                                src={carPreview}
                                alt="Car Glass Reference"
                                className="w-full h-full object-contain drop-shadow-lg"
                                style={{ position: 'absolute', top: 0, left: 0 }}
                            />
                            {GLASS_OVERLAYS.map((overlay) => (
                                <img
                                    key={overlay.id}
                                    src={overlay.src}
                                    alt={overlay.alt}
                                    className={overlay.className}
                                    style={overlay.style}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicContactRoot;


