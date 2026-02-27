import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Input, Button, Badge, Avatar } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import moment from 'moment';

const CustomerChatWidget = ({ themeColor, businessName, customerName, customerEmail }) => {
    const {
        connectionStatus,
        conversations,
        sendMessage,
        sendCustomerMessage,
        activeConversationId,
        setActiveConversationId,
        visitorId
    } = useChat();

    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const [hasUnread, setHasUnread] = useState(false);

    // Local state for visitor info, prioritized from props, then localStorage
    const [visitorInfo, setVisitorInfo] = useState({
        name: localStorage.getItem('visitorName') || '',
        email: localStorage.getItem('visitorEmail') || ''
    });

    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    // Update local state if props change (user typing in form)
    useEffect(() => {
        if (customerName || customerEmail) {
            setVisitorInfo(prev => ({
                name: customerName || prev.name,
                email: customerEmail || prev.email
            }));
            setIsFormSubmitted(true);
        } else {
            // Check localStorage
            const storedName = localStorage.getItem('visitorName');
            const storedEmail = localStorage.getItem('visitorEmail');
            if (storedName && storedEmail) {
                setVisitorInfo({
                    name: storedName,
                    email: storedEmail
                });
                setIsFormSubmitted(true);
            }
        }
    }, [customerName, customerEmail]);

    // Get current conversation
    // For customer, there's usually only one relevant conversation in the map, 
    // or we need to find it by visitorId. 
    // ChatContext handles one conversation per visitorId effectively for now.
    // We'll use the first one in the list or the one matching activeConversationId.
    // If activeConversationId is null, we might not have a conversation yet (Backend hasn't created it).
    // In that case, we show empty state, and sending a message will create it.

    // Fallback: finding conversation by visitorId if possible or just taking object values[0]
    const conversation = activeConversationId
        ? conversations[activeConversationId]
        : Object.values(conversations)[0];

    const messages = conversation?.messages || [];

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && isFormSubmitted) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isFormSubmitted]);

    // Check for unread when closed
    useEffect(() => {
        if (!isOpen && conversation?.unreadCount > 0) {
            setHasUnread(true);
        } else if (isOpen) {
            setHasUnread(false);
        }
    }, [conversation?.unreadCount, isOpen]);

    // Auto-set active conversation if we receive one and none is active
    useEffect(() => {
        if (!activeConversationId && conversation) {
            setActiveConversationId(conversation.id);
        }
    }, [conversation, activeConversationId, setActiveConversationId]);

    const handleFormSubmit = (e) => {
        e.preventDefault(); // In case it's a form
        if (visitorInfo.name && visitorInfo.email) {
            localStorage.setItem('visitorName', visitorInfo.name);
            localStorage.setItem('visitorEmail', visitorInfo.email);
            setIsFormSubmitted(true);
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        // If no messages yet, this is the First Message -> Send with details
        if (messages.length === 0) {
            const nameToSend = visitorInfo.name || "Visitor";
            const emailToSend = visitorInfo.email || "no-email@test.com"; // Fallback if absolutely nothing provided

            // Save to localStorage for future sessions - redundant but safe
            if (visitorInfo.name) localStorage.setItem('visitorName', visitorInfo.name);
            if (visitorInfo.email) localStorage.setItem('visitorEmail', visitorInfo.email);

            sendCustomerMessage(inputText, nameToSend, emailToSend);
        } else {
            // Subsequent messages
            // We need conversationId. If we have 'conversation' object, use its ID.
            // If we don't have a conversation object yet (e.g. optimistic update hasn't happened or backend hasn't replied to first msg),
            // technically we main need to wait or allow optimistic creation.
            // But 'sendCustomerMessage' handles the "no conversation yet" case by sending visitorId.
            // 'sendMessage' also handles visitorId case in ChatContext if isPublic is true.
            // So actually `sendMessage` in Context (lines 222-245) handles isPublic -> uses visitorId.
            // But `sendCustomerMessage` adds name/email.

            // So: Always proper to use `sendMessage` if we are just chatting.
            // BUT for the very first one we want to ensure name/email are attached.

            if (conversation && conversation.id) {
                sendMessage(conversation.id, inputText);
            } else {
                // Fallback if we somehow have messages but no ID (shouldn't happen) or just strict fallback
                // Use sendCustomerMessage again to be safe? 
                // Actually `sendMessage` in context handles `isPublic` by using `visitorId` and standard payload.
                // So we can use `sendMessage(null, inputText)` if we want context to handle it?
                // No, context `sendMessage` takes `conversationId`.
                // If isPublic, context ignores conversationId and uses visitorId.
                sendMessage(null, inputText);
            }
        }

        setInputText('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    // Helper to convert hex to rgb components for the glow effect
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#7E5CFE');
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 126, g: 92, b: 254 }; // Default #7E5CFE
    };

    const glowRgb = hexToRgb(themeColor);

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
            <style>{`
                @keyframes flowingGlow {
                    0% { box-shadow: 0 0 10px 0px rgba(var(--glow-r), var(--glow-g), var(--glow-b), 0.3); }
                    50% { box-shadow: 0 0 25px 5px rgba(var(--glow-r), var(--glow-g), var(--glow-b), 0.5); }
                    100% { box-shadow: 0 0 10px 0px rgba(var(--glow-r), var(--glow-g), var(--glow-b), 0.3); }
                }
                .glow-button {
                    animation: flowingGlow 2.5s ease-in-out infinite;
                }
            `}</style>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="bg-white w-full max-w-[350px] sm:w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-slate-100 animate-slideUp"
                    style={{
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-4 flex justify-between items-center text-white"
                        style={{ background: themeColor || '#7E5CFE' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <ShopOutlined className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white leading-tight">{businessName || 'Support'}</h3>
                                <p className="text-xs text-white/80">
                                    {connectionStatus === 'connected' ? 'We are online' : 'Connecting...'}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="text"
                            icon={<CloseOutlined className="text-white text-lg" />}
                            onClick={handleToggle}
                            className="hover:bg-white/20"
                        />
                    </div>

                    {!isFormSubmitted ? (
                        // ONBOARDING FORM
                        <div className="flex-1 p-6 flex flex-col justify-center bg-slate-50">
                            <div className="text-center mb-6">
                                <h4 className="text-lg font-bold text-slate-700 mb-2">Welcome!</h4>
                                <p className="text-sm text-slate-500">Please enter your details to start chatting with us.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                                    <Input
                                        placeholder="Your Name"
                                        value={visitorInfo.name}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                                        prefix={<UserOutlined className="text-slate-400" />}
                                        className="rounded-lg py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                    <Input
                                        placeholder="your@email.com"
                                        value={visitorInfo.email}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                                        prefix={<MessageOutlined className="text-slate-400" />}
                                        className="rounded-lg py-2"
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    onClick={handleFormSubmit}
                                    style={{ backgroundColor: themeColor || '#7E5CFE' }}
                                    className="h-10 rounded-lg font-semibold mt-2"
                                    disabled={!visitorInfo.name || !visitorInfo.email}
                                >
                                    Start Chat
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // CHAT INTERFACE
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                                        <MessageOutlined className="text-4xl mb-3 opacity-30" />
                                        <p className="text-sm">Hi {visitorInfo.name}! How can we help you with your auto glass needs today?</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        // SenderType 'SHOP' means incoming for us
                                        // Use case-insensitive check for robustness
                                        const isShop = msg.senderType?.toUpperCase() === 'SHOP';

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex w-full ${isShop ? 'justify-start' : 'justify-end'} mb-2`}
                                            >
                                                {isShop && (
                                                    <Avatar
                                                        size="small"
                                                        icon={<ShopOutlined />}
                                                        className="mr-2 mt-1 shrink-0"
                                                        style={{ backgroundColor: themeColor || '#7E5CFE' }}
                                                    />
                                                )}
                                                <div
                                                    className={`
                                                        max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words
                                                        ${isShop
                                                            ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                                            : 'text-white rounded-tr-none'
                                                        }
                                                    `}
                                                    style={!isShop ? { backgroundColor: themeColor || '#7E5CFE' } : {}}
                                                >
                                                    <p className="m-0 leading-snug">{msg.message}</p>
                                                    <div
                                                        className={`text-[10px] mt-1 text-right opacity-70 ${isShop ? 'text-slate-500' : 'text-white'
                                                            }`}
                                                    >
                                                        {moment(msg.timestamp).format('HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onPressEnter={handleSend}
                                        disabled={connectionStatus !== 'connected'}
                                        className="rounded-full bg-slate-50 border-slate-200 hover:bg-white focus:bg-white"
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<SendOutlined />}
                                        onClick={handleSend}
                                        disabled={connectionStatus !== 'connected' || !inputText.trim()}
                                        style={{ backgroundColor: themeColor || '#7E5CFE' }}
                                    />
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-slate-400">Powered by AutoPane</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={handleToggle}
                className={`glow-button group flex items-center justify-center gap-2 transition-all hover:scale-105 rounded-full px-5 h-[60px] text-white font-medium text-base ${isOpen ? 'rotate-90 opacity-0 absolute pointer-events-none' : 'rotate-0'}`}
                style={{
                    backgroundColor: themeColor || '#7E5CFE',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    '--glow-r': glowRgb.r,
                    '--glow-g': glowRgb.g,
                    '--glow-b': glowRgb.b
                }}
            >
                <Badge count={hasUnread ? 1 : 0} dot color="red" offset={[-5, 5]}>
                    <MessageOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
                </Badge>
                <span className="block group-hover:hidden transition-all duration-300 text-white" style={{ color: '#ffffff' }}>Live Chat</span>
                <span className="hidden group-hover:block transition-all duration-300 whitespace-nowrap text-white" style={{ color: '#ffffff' }}>Chat Now</span>
            </button>

            {/* Close Button when open - Optional, can just use the X in header, or make the FAB turn into X */}
            {isOpen && (
                <button
                    onClick={handleToggle}
                    className="shadow-xl flex items-center justify-center transition-transform hover:scale-105 rounded-full"
                    style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <CloseOutlined style={{ fontSize: '24px' }} />
                </button>
            )}
        </div>
    );
};

export default CustomerChatWidget;
