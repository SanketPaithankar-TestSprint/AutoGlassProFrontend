// src/components/PublicContact/PublicContactRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { validateSlug, sendAiChatMessage } from '../../api/publicContactForm';
import { getOrCreateSessionId, clearSessionId, generateSessionId } from '../../utils/sessionUtils';

// Import components
import BrandedHeader from './BrandedHeader';
import ProgressIndicator from './ProgressIndicator';
import MessageBubble from './MessageBubble';
import OptionTiles from './OptionTiles';
import GroupedOptionTiles from './GroupedOptionTiles';
import GlassSelector from './GlassSelector';
import WindshieldFeaturesSelector from './WindshieldFeaturesSelector';
import ChatInput from './ChatInput';
import CompletionScreen from './CompletionScreen';
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

    // Chat state
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availableOptions, setAvailableOptions] = useState(null);
    const [collectedData, setCollectedData] = useState({});
    const [currentPhase, setCurrentPhase] = useState('info');
    const [isComplete, setIsComplete] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Theme color with fallback
    const themeColor = businessInfo?.themeColor || '#7E5CFE';

    // Apply theme color to CSS custom property
    useEffect(() => {
        if (themeColor) {
            document.documentElement.style.setProperty('--theme-color', themeColor);
        }
    }, [themeColor]);

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
                    });

                    // Generate session ID
                    const newSessionId = generateSessionId();
                    setSessionId(newSessionId);

                    // Add initial greeting message
                    const greeting = {
                        id: Date.now(),
                        text: `Hi! I'm here to help you get a quote for ${response.data.business_name}. To get started, could you please share your name, email, and phone number?`,
                        sender: 'ai',
                    };
                    setMessages([greeting]);
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

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, availableOptions]);

    // Determine phase from action
    const determinePhase = (action) => {
        const infoActions = ['ask_name', 'ask_email', 'ask_phone', 'greeting'];
        const vehicleActions = ['ask_year', 'ask_make', 'ask_model', 'ask_body', 'ask_body_style'];
        const glassActions = ['ask_glass', 'ask_glass_type', 'confirm', 'complete'];

        if (infoActions.includes(action)) return 'info';
        if (vehicleActions.includes(action)) return 'vehicle';
        if (glassActions.includes(action)) return 'glass';
        return currentPhase; // Keep current if unknown
    };

    // Handle sending a message
    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || isLoading) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setAvailableOptions(null); // Clear options while loading

        try {
            const response = await sendAiChatMessage(sessionId, messageText, userId);

            // Add AI response message
            if (response.message) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: response.message,
                    sender: 'ai',
                };
                setMessages(prev => [...prev, aiMessage]);
            }

            // Update collected data
            if (response.collected_data) {
                setCollectedData(response.collected_data);
            }

            // Update phase
            if (response.action) {
                setCurrentPhase(determinePhase(response.action));
            }

            // Handle available options with proper parsing based on API response format
            if (response.available_options) {
                try {
                    const opts = response.available_options;

                    // Debug log to see what we're receiving
                    console.log('Available options received:', opts);

                    // Handle based on type field from API
                    if (opts.type === 'body_styles' && Array.isArray(opts.options)) {
                        // Body styles: flat list with {index, abbrev, desc, id}
                        // Map to use 'desc' as the display label
                        const mappedOptions = opts.options.map(opt => ({
                            ...opt,
                            label: opt.desc, // Use desc as the display label
                            value: opt.id,   // Use id as the value
                        }));
                        setAvailableOptions({
                            type: 'flat',
                            data: mappedOptions,
                            label: opts.label || 'Select body style',
                        });
                    } else if (opts.type === 'glass_types' && opts.grouped && Array.isArray(opts.groups)) {
                        // Glass types: grouped format with {group, options: [{index, type, prefix, code, desc}]}
                        // Convert groups array to object format for GroupedOptionTiles
                        const groupedData = {};
                        opts.groups.forEach(grp => {
                            groupedData[grp.group] = grp.options.map(opt => ({
                                ...opt,
                                label: opt.desc, // Use desc as the display label
                                value: opt.code, // Use code as the value
                            }));
                        });
                        setAvailableOptions({
                            type: 'grouped',
                            data: groupedData,
                            label: opts.label || 'Select glass type',
                        });
                    } else if (opts.type === 'windshield_features' && Array.isArray(opts.options)) {
                        // Windshield features: multi-select list with {id, name}
                        setAvailableOptions({
                            type: 'windshield_features',
                            data: opts.options,
                            label: opts.label || 'Select windshield features',
                            multiple: opts.multiple || true,
                        });
                    } else if (Array.isArray(opts.options)) {
                        // Generic flat options with {index, desc, id} or similar
                        const mappedOptions = opts.options.map(opt => ({
                            ...opt,
                            label: opt.desc || opt.name || opt.label || JSON.stringify(opt),
                            value: opt.id || opt.value || opt.index,
                        }));
                        setAvailableOptions({
                            type: 'flat',
                            data: mappedOptions,
                            label: opts.label || 'Select an option',
                        });
                    } else if (Array.isArray(opts)) {
                        // Direct array of options (fallback)
                        setAvailableOptions({
                            type: 'flat',
                            data: opts,
                            label: response.available_options_label || '',
                        });
                    } else {
                        // Unknown format - log and skip
                        console.warn('Unknown available_options format:', opts);
                        setAvailableOptions(null);
                    }
                } catch (parseError) {
                    console.error('Error parsing available_options:', parseError);
                    setAvailableOptions(null);
                }
            } else {
                setAvailableOptions(null);
            }

            // Check if complete
            if (response.status === 'complete') {
                setIsComplete(true);
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, something went wrong. Please try again.",
                sender: 'ai',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle option tile selection (for body styles, makes, models)
    const handleOptionSelect = (option) => {
        const optionText = option.label || option.name || option.value || option;
        handleSendMessage(String(optionText));
    };

    // Handle glass selection submit (for multi-select glass types)
    const handleGlassSelection = (selection) => {
        // selection = { type: 'multiple', glasses: [...], displayText: '...' }
        handleSendMessage(selection.displayText);
    };

    // Handle windshield features selection submit (for multi-select features)
    const handleWindshieldFeaturesSelection = (selection) => {
        // selection = { type: 'windshield_features', features: [...], displayText: '...' }
        handleSendMessage(selection.displayText);
    };

    // Handle starting a new inquiry
    const handleNewInquiry = () => {
        // Clear session
        clearSessionId(slug);

        // Reset state
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        setMessages([{
            id: Date.now(),
            text: `Hi! I'm here to help you get a quote for ${businessInfo?.businessName || 'our service'}. To get started, could you please share your name, email, and phone number?`,
            sender: 'ai',
        }]);
        setAvailableOptions(null);
        setCollectedData({});
        setCurrentPhase('info');
        setIsComplete(false);
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

    // Completion screen
    if (isComplete) {
        return (
            <div className="public-contact-page" style={{ '--theme-color': themeColor }}>
                <BrandedHeader
                    businessName={businessInfo?.businessName}
                    logoUrl={businessInfo?.logoUrl}
                    tagline={businessInfo?.tagline}
                    themeColor={themeColor}
                />
                <CompletionScreen
                    businessName={businessInfo?.businessName}
                    collectedData={collectedData}
                    onNewInquiry={handleNewInquiry}
                    themeColor={themeColor}
                />
                <PublicContactFooter />
            </div>
        );
    }

    // Main chat interface
    return (
        <div className="public-contact-page" style={{ '--theme-color': themeColor }}>
            <BrandedHeader
                businessName={businessInfo?.businessName}
                logoUrl={businessInfo?.logoUrl}
                tagline={businessInfo?.tagline}
                themeColor={themeColor}
            />

            <ProgressIndicator
                currentPhase={currentPhase}
                themeColor={themeColor}
            />

            <div className="chat-container" ref={chatContainerRef}>
                <div className="message-list">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message.text}
                            sender={message.sender}
                            themeColor={themeColor}
                        />
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="message-wrapper ai">
                            <div className="message-avatar ai">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                                </svg>
                            </div>
                            <div className="message-bubble ai">
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Option tiles */}
                    {availableOptions && !isLoading && (
                        availableOptions.type === 'grouped' ? (
                            <GlassSelector
                                groupedOptions={availableOptions.data}
                                onSubmit={handleGlassSelection}
                                themeColor={themeColor}
                                label={availableOptions.label}
                            />
                        ) : availableOptions.type === 'windshield_features' ? (
                            <WindshieldFeaturesSelector
                                options={availableOptions.data}
                                onSubmit={handleWindshieldFeaturesSelection}
                                themeColor={themeColor}
                                label={availableOptions.label}
                            />
                        ) : (
                            <OptionTiles
                                options={availableOptions.data}
                                onSelect={handleOptionSelect}
                                themeColor={themeColor}
                                label={availableOptions.label}
                            />
                        )
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading}
                themeColor={themeColor}
                placeholder="Type your message..."
            />

            <PublicContactFooter />
        </div>
    );
};

export default PublicContactRoot;
