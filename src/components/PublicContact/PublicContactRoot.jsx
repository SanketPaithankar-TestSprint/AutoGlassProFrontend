// src/components/PublicContact/PublicContactRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Upload, Button } from 'antd';
import { UploadOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { validateSlug, submitContactForm, createServiceInquiry, decodeVin, fetchVehicleMakes, fetchVehicleModels } from '../../api/publicContactForm';
import { clearSessionId, generateSessionId } from '../../utils/sessionUtils';

// Import components
import BrandedHeader from './BrandedHeader';
import NotFoundPage from './NotFoundPage';
import PublicContactFooter from './PublicContactFooter';
import { ChatProvider } from '../../context/ChatContext';
import CustomerChatWidget from './CustomerChatWidget';

// Import styles
import './PublicContact.css';

// Import Assets
import carPreview from '../../assets/ContactFormCar.png';
import windshieldSensorGuide from '../../assets/windshield_sensor_guide.png';
import { GLASS_OVERLAYS } from './const/imageConfig';

// Utility for classNames
function cn(...inputs) {
    return clsx(inputs);
}
// Memoized Map component to prevent re-renders

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

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, min] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${min} ${ampm}`;
};

const formatOpeningHours = (openHours) => {
    if (!openHours) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getHoursString = (day) => {
        const data = openHours[day];
        if (!data || !data.intervals || data.intervals.length === 0) return 'Closed';
        const { from, to } = data.intervals[0];
        return `${formatTime(from)} – ${formatTime(to)}`;
    };

    // Calculate grouped hours
    const groupedHours = [];
    if (days.length > 0) {
        let currentGroup = {
            startDayIndex: 0,
            hours: getHoursString(days[0])
        };

        for (let i = 1; i < days.length; i++) {
            const hours = getHoursString(days[i]);
            if (hours === currentGroup.hours) {
                continue;
            } else {
                groupedHours.push({
                    label: currentGroup.startDayIndex === i - 1
                        ? `${shortDays[currentGroup.startDayIndex]}`
                        : `${shortDays[currentGroup.startDayIndex]}-${shortDays[i - 1]}`,
                    hours: currentGroup.hours
                });
                currentGroup = {
                    startDayIndex: i,
                    hours: hours
                };
            }
        }
        // Push the last group
        groupedHours.push({
            label: currentGroup.startDayIndex === days.length - 1
                ? `${shortDays[currentGroup.startDayIndex]}`
                : `${shortDays[currentGroup.startDayIndex]}-${shortDays[days.length - 1]}`,
            hours: currentGroup.hours
        });
    }

    return (
        <div className="flex flex-col gap-0.5">
            {groupedHours.map((group, idx) => (
                <div key={idx} className="flex items-baseline text-[14px] leading-snug">
                    <span className="font-semibold text-slate-800 min-w-[70px]">{group.label}:</span>
                    <span className={group.hours === 'Closed' ? 'text-slate-500' : 'text-slate-700'}>
                        {group.hours}
                    </span>
                </div>
            ))}
        </div>
    );
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
    const [useVinDecoding, setUseVinDecoding] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        vin: '',
        licensePlateNumber: '',
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
                        longitude: response.data.longitude,
                        openHours: response.data.open_hours_json
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
                licensePlateNumber: formData.licensePlateNumber,
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
            licensePlateNumber: '',
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
        <ChatProvider isPublic={true} publicUserId={userId}>
            <div
                className="bg-white text-gray-900 font-sans selection:bg-yellow-200 h-screen w-full overflow-hidden flex flex-col"
                style={{
                    '--theme-color': themeColor,
                    background: `linear-gradient(135deg, ${themeColor}26 0%, #ffffff 50%, ${themeColor}12 100%)`
                }}
            >
                <CustomerChatWidget
                    themeColor={themeColor}
                    businessName={businessInfo?.businessName}
                    customerName={formData.name}
                    customerEmail={formData.email}
                />


                {/* Main Content - Strictly Single Page on Desktop */}
                <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">

                    {/* MOBILE ONLY: Top Design (Glass Reference) */}
                    <div className="md:hidden w-full h-64 shrink-0 relative group overflow-hidden border-b border-gray-200">
                        <GlassReference
                            serviceType={formData.serviceType}
                            carPreview={carPreview}
                            windshieldSensorGuide={windshieldSensorGuide}
                        />
                    </div>

                    {/* Form Area */}
                    <div className="w-full md:w-[60%] h-auto md:h-full md:overflow-y-auto custom-scrollbar relative bg-gray-50 flex-shrink-0">
                        <div className="p-4 md:p-6 lg:p-8 min-h-full">
                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <SuccessScreen
                                        key="success"
                                        onReset={handleNewMessage}
                                        businessName={businessInfo?.businessName}
                                        themeColor={themeColor}
                                    />
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="max-w-2xl mx-auto">
                                            <div className="space-y-2 mb-4">
                                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <span className="w-8 h-1 bg-yellow-500 rounded-full block" style={{ backgroundColor: themeColor }}></span>
                                                    Request a Quote
                                                </h2>
                                                <p className="text-gray-500 text-xs">Fill out the form below and we'll get back to you within 30 minutes during business hours.</p>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-3">
                                                {/* Service Type Dropdown */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Type <span className="text-red-500">*</span></label>
                                                    <select
                                                        name="serviceType"
                                                        value={formData.serviceType}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                    >
                                                        <option value="">Select service type</option>
                                                        {serviceTypeOptions.map((opt, idx) => (<option key={idx} value={opt}>{opt}</option>))}
                                                    </select>
                                                </div>

                                                {/* Windshield Features - Show right after service type selection */}
                                                {formData.serviceType === 'Windshield Replacement' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Features <span className="text-red-500">*</span></p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {windshieldFeatureOptions.map((feature) => (
                                                                <label key={feature} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
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
                                                    </motion.div>
                                                )}

                                                {/* Window Rolling Location */}
                                                {formData.serviceType === 'Window Rolling Issue' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location <span className="text-red-500">*</span></p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {windowRollingOptions.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="windowRollingLocation"
                                                                        value={option}
                                                                        checked={formData.windowRollingLocation === option}
                                                                        onChange={handleInputChange}
                                                                        required
                                                                        className="w-3.5 h-3.5"
                                                                        style={{ accentColor: themeColor }}
                                                                    />
                                                                    {option}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Vent Glass Location */}
                                                {formData.serviceType === 'Vent Glass Replacement' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location <span className="text-red-500">*</span></p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {ventGlassOptions.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="ventGlassLocation"
                                                                        value={option}
                                                                        checked={formData.ventGlassLocation === option}
                                                                        onChange={handleInputChange}
                                                                        required
                                                                        className="w-3.5 h-3.5"
                                                                        style={{ accentColor: themeColor }}
                                                                    />
                                                                    {option}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Door Glass Location */}
                                                {formData.serviceType === 'Door Glass Replacement' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location <span className="text-red-500">*</span></p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {doorGlassOptions.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="doorGlassLocation"
                                                                        value={option}
                                                                        checked={formData.doorGlassLocation === option}
                                                                        onChange={handleInputChange}
                                                                        required
                                                                        className="w-3.5 h-3.5"
                                                                        style={{ accentColor: themeColor }}
                                                                    />
                                                                    {option}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Quarter Glass Location */}
                                                {formData.serviceType === 'Quarter Glass Replacement' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location <span className="text-red-500">*</span></p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {quarterGlassOptions.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="quarterGlassLocation"
                                                                        value={option}
                                                                        checked={formData.quarterGlassLocation === option}
                                                                        onChange={handleInputChange}
                                                                        required
                                                                        className="w-3.5 h-3.5"
                                                                        style={{ accentColor: themeColor }}
                                                                    />
                                                                    {option}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* License Plate */}
                                                {formData.serviceType && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="space-y-2"
                                                    >
                                                        <label className="text-xs font-medium text-gray-600">License Plate (Optional)</label>
                                                        <input
                                                            type="text"
                                                            name="licensePlateNumber"
                                                            value={formData.licensePlateNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="License Plate"
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                        />
                                                    </motion.div>
                                                )}

                                                {/* VIN Decoding Section */}
                                                {formData.serviceType && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={useVinDecoding}
                                                                    onChange={(e) => setUseVinDecoding(e.target.checked)}
                                                                    className="w-4 h-4 rounded"
                                                                />
                                                                <span className="text-sm font-medium text-gray-700">Search by VIN</span>
                                                            </label>
                                                        </div>

                                                        {useVinDecoding ? (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium text-gray-600">VIN (17 characters)</label>
                                                                <div className="flex gap-2 items-end">
                                                                    <input
                                                                        type="text"
                                                                        name="vin"
                                                                        value={formData.vin}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Enter VIN"
                                                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleVinLookup}
                                                                        disabled={vinLoading || !formData.vin}
                                                                        className="h-10 px-3 text-xs font-medium border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                                                        style={{
                                                                            borderColor: themeColor,
                                                                            color: themeColor,
                                                                            backgroundColor: 'white'
                                                                        }}
                                                                    >
                                                                        {vinLoading ? '...' : 'Decode'}
                                                                    </button>
                                                                </div>

                                                                {/* Display Decoded Vehicle Info */}
                                                                {(formData.year || formData.make || formData.model) && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -5 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="p-2 bg-blue-50 border border-blue-100 rounded-lg"
                                                                    >
                                                                        <div className="text-xs text-gray-700 space-y-1">
                                                                            {formData.year && <div><span className="font-medium text-gray-600">Year:</span> {formData.year}</div>}
                                                                            {formData.make && <div><span className="font-medium text-gray-600">Make:</span> {formData.make}</div>}
                                                                            {formData.model && <div><span className="font-medium text-gray-600">Model:</span> {formData.model}</div>}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <Select
                                                                    showSearch
                                                                    placeholder="Year"
                                                                    value={formData.year || undefined}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                                                                    filterOption={(input, option) =>
                                                                        (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                                    }
                                                                    className="w-full"
                                                                    style={{ height: '40px' }}
                                                                    dropdownStyle={{ zIndex: 9999 }}
                                                                >
                                                                    {yearOptions.map(year => (
                                                                        <Select.Option key={year} value={year}>{year}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                                <Select
                                                                    showSearch
                                                                    placeholder="Make"
                                                                    value={formData.make || undefined}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, make: value, model: '' }))}
                                                                    filterOption={(input, option) =>
                                                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                                    }
                                                                    className="w-full"
                                                                    style={{ height: '40px' }}
                                                                    dropdownStyle={{ zIndex: 9999 }}
                                                                >
                                                                    {makeOptions.map((make) => (
                                                                        <Select.Option key={make.Make_ID} value={make.Make_Name}>{make.Make_Name}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                                <Select
                                                                    showSearch
                                                                    placeholder="Model"
                                                                    value={formData.model || undefined}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                                                                    disabled={!formData.make}
                                                                    filterOption={(input, option) =>
                                                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                                    }
                                                                    className="w-full"
                                                                    style={{ height: '40px' }}
                                                                    dropdownStyle={{ zIndex: 9999 }}
                                                                >
                                                                    {modelOptions.map((model) => (
                                                                        <Select.Option key={model.Model_ID} value={model.Model_Name}>{model.Model_Name}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Your Information - 2x2 Grid */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Information <span className="text-red-500">*</span></label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            placeholder="Full Name"
                                                            required
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                        />
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="Phone Number"
                                                            required
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                        />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            placeholder="Email Address"
                                                            required
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleInputChange}
                                                            placeholder="City, State"
                                                            required={!isMobile}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Service Preference */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Service Preference <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="servicePreference"
                                                                value="In-shop service"
                                                                checked={formData.servicePreference === 'In-shop service'}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-4 h-4"
                                                                style={{ accentColor: themeColor }}
                                                            />
                                                            <span className="text-sm text-gray-700">In-shop</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="servicePreference"
                                                                value="Mobile service"
                                                                checked={formData.servicePreference === 'Mobile service'}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-4 h-4"
                                                                style={{ accentColor: themeColor }}
                                                            />
                                                            <span className="text-sm text-gray-700">Mobile</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Mobile Service Address Fields */}
                                                {isMobile && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="space-y-3"
                                                    >
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Address <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="street"
                                                                value={formData.street}
                                                                onChange={handleInputChange}
                                                                placeholder="Street Address"
                                                                required
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                name="city"
                                                                value={formData.city}
                                                                onChange={handleInputChange}
                                                                placeholder="City"
                                                                required
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                name="zipcode"
                                                                value={formData.zipcode}
                                                                onChange={handleInputChange}
                                                                placeholder="Zip Code"
                                                                required
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}


                                                {/* Additional Details */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Details</label>
                                                    <textarea
                                                        name="message"
                                                        value={formData.message}
                                                        onChange={handleInputChange}
                                                        placeholder="Describe any additional details (optional)..."
                                                        rows={3}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm resize-none"
                                                    />
                                                </div>

                                                {/* File Upload */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Image (Optional)</label>
                                                    <Upload
                                                        beforeUpload={() => false}
                                                        fileList={fileList}
                                                        onChange={({ fileList }) => setFileList(fileList)}
                                                        accept="image/*"
                                                    >
                                                        <Button icon={<UploadOutlined />} className="w-full">Click to Upload</Button>
                                                    </Upload>
                                                </div>

                                                {/* Submit Button */}
                                                <button
                                                    disabled={formLoading}
                                                    type="submit"
                                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                                    style={{
                                                        backgroundColor: themeColor,
                                                        boxShadow: `0 10px 25px -5px ${themeColor}33`
                                                    }}
                                                >
                                                    {formLoading ? (
                                                        <>
                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Get Quote <span className="opacity-75">&rarr;</span>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* MOBILE ONLY: Bottom Info + Map */}
                    <div className="md:hidden w-full bg-white border-t border-gray-200">
                        <div className="border-b border-gray-200">
                            <ShopInfo
                                businessInfo={businessInfo}
                                themeColor={themeColor}
                                className="h-auto py-6"
                            />
                        </div>
                        {businessInfo?.maps && (
                            <div className="h-64">
                                <MapEmbed html={businessInfo.maps} />
                            </div>
                        )}
                    </div>

                    {/* DESKTOP ONLY: Right Column: Info/Map/Visuals */}
                    <div className="hidden md:flex w-[40%] bg-white border-l border-gray-200 flex-col h-full shadow-lg z-10 flex-shrink-0">

                        {/* Top: Glass Reference (30%) */}
                        <div className="h-[30%] shrink-0 relative group overflow-hidden">
                            <GlassReference
                                serviceType={formData.serviceType}
                                carPreview={carPreview}
                                windshieldSensorGuide={windshieldSensorGuide}
                            />
                        </div>

                        {/* Middle: Shop Info (Flex-1) */}
                        <div className="flex-1 bg-white border-t border-b border-gray-200 relative p-0 overflow-hidden">
                            <ShopInfo
                                businessInfo={businessInfo}
                                themeColor={themeColor}
                                className="h-full"
                            />
                        </div>

                        {/* Bottom: Map (30%) */}
                        {businessInfo?.maps && (
                            <div className="h-[30%] shrink-0">
                                <MapEmbed html={businessInfo.maps} />
                            </div>
                        )}
                    </div>
                </main>

                <CustomerChatWidget themeColor={themeColor} businessName={businessInfo?.businessName} />

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f9fafb; 
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1; 
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8; 
                    }
                `}</style>
            </div>
        </ChatProvider>
    );
};

// Glass Reference Component
const GlassReference = ({ serviceType, carPreview, windshieldSensorGuide }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const isSensorService = serviceType === 'Windshield Replacement';

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-100 flex flex-col group">
            {/* Info Icon with Tooltip */}
            <div className="absolute top-4 left-4 z-10 flex items-center">
                <div
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <InfoCircleOutlined className="text-xl text-gray-600 cursor-help hover:text-gray-900 transition-colors" />

                    {/* Tooltip */}
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-8 top-0 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none"
                        >
                            {isSensorService ? 'Sensor Guide' : 'Glass Diagram'}
                            <div className="absolute right-full top-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {isSensorService ? (
                    <motion.img
                        key="sensor"
                        src={windshieldSensorGuide}
                        alt="Sensor Guide"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <motion.img
                        key="diagram"
                        src={carPreview}
                        alt="Glass Diagram"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

// Map Component
const MapEmbed = React.memo(({ html }) => (
    <div
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: html }}
    />
));

// Shop Info Component
const ShopInfo = ({ businessInfo, themeColor, className }) => {
    return (
        <div className={cn("flex flex-col bg-white text-gray-600", className)}>
            <div className="shrink-0 px-6 pt-4 pb-2">
                <h3 className="text-gray-900 font-bold text-lg mb-1">
                    {businessInfo?.businessName}
                </h3>
                {businessInfo?.tagline && (
                    <p className="text-gray-500 text-xs">
                        {businessInfo?.tagline}
                    </p>
                )}
            </div>

            <div className="text-sm flex-1 flex flex-col justify-start px-6 pb-4 overflow-hidden">
                {/* Call Us and Address - Side by Side */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {businessInfo?.phone && (
                        <div className="flex gap-2 items-start">
                            <PhoneOutlined className="mt-0.5 flex-shrink-0 text-base" style={{ color: themeColor }} />
                            <div className="min-w-0">
                                <p className="text-gray-900 font-medium leading-tight text-xs">Call Us</p>
                                <a href={`tel:${businessInfo.phone}`} className="hover:opacity-75 transition-opacity leading-tight text-xs break-all">
                                    {formatPhoneNumber(businessInfo.phone)}
                                </a>
                                <p className="text-[9px] text-gray-400 mt-0.5">24/7 Support</p>
                            </div>
                        </div>
                    )}

                    {businessInfo?.address && (
                        <div className="flex gap-2 items-start">
                            <EnvironmentOutlined className="mt-0.5 flex-shrink-0 text-base" style={{ color: themeColor }} />
                            <div className="min-w-0">
                                <p className="text-gray-900 font-medium leading-tight text-xs">Address</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-75 transition-opacity leading-tight text-xs break-words"
                                >
                                    {businessInfo.address}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {businessInfo?.email && (
                    <div className="flex gap-2 items-start mb-3">
                        <MailOutlined className="text-gray-400 mt-0.5 flex-shrink-0 text-base" />
                        <div className="min-w-0">
                            <p className="text-gray-900 font-medium leading-tight text-xs">Email</p>
                            <a href={`mailto:${businessInfo.email}`} className="hover:opacity-75 transition-opacity leading-tight text-xs break-all">
                                {businessInfo.email}
                            </a>
                        </div>
                    </div>
                )}

                {businessInfo?.openHours && (
                    <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="flex gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${themeColor}15` }}
                            >
                                <ClockCircleOutlined style={{ color: themeColor, fontSize: '18px' }} />
                            </div>
                            <div>
                                <h4 className="text-slate-500 font-medium text-sm mb-1">Hours</h4>
                                {formatOpeningHours(businessInfo.openHours)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Success Screen Component
const SuccessScreen = ({ onReset, businessName, themeColor }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-md mx-auto"
    >
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
            <CheckCircleOutlined className="text-3xl" style={{ color: themeColor }} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
            <p className="text-gray-600 text-sm">
                Thanks for contacting {businessName}. We have received your details and a technician will contact you shortly.
            </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 w-full shadow-sm">
            <h4 className="text-gray-900 text-sm font-bold mb-3">Next Steps:</h4>
            <ul className="text-left text-xs text-gray-600 space-y-2">
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: themeColor }} />
                    Review estimate via email
                </li>
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: themeColor }} />
                    Confirm appointment time
                </li>
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: themeColor }} />
                    Prepare vehicle for service
                </li>
            </ul>
        </div>
        <button
            onClick={onReset}
            className="font-medium text-sm transition-colors hover:opacity-75"
            style={{ color: themeColor }}
        >
            Submit another request
        </button>
    </motion.div>
);

export default PublicContactRoot;


