import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Input, Button, Badge, Avatar } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

const CustomerChatWidget = ({ themeColor, businessName }) => {
    const {
        socket,
        connectionStatus,
        conversations,
        sendMessage,
        activeConversationId,
        setActiveConversationId,
        loadHistory
    } = useChat();

    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const [hasUnread, setHasUnread] = useState(false);

    // Initial Conversation Setup
    useEffect(() => {
        // For customer, we might want to generate a conversation ID or let the backend/socket handle it.
        // The blueprint says:
        // Client -> Server: { action: "sendMessage", conversationId: "conv-1", ... }
        // So the Frontend determines the conversation ID initially? 
        // Or if we don't have one, we generate one.
        // Usually, for anonymous / guest users, we can store a random ID in localStorage.

        let storedConvId = localStorage.getItem('customerConversationId');
        if (!storedConvId) {
            storedConvId = `conv-${uuidv4().substring(0, 8)}`;
            localStorage.setItem('customerConversationId', storedConvId);
        }

        if (connectionStatus === 'connected') {
            setActiveConversationId(storedConvId);
            // Attempt to load history if we have an ID
            // The chat context `loadHistory` implementation sends `getHistory` action.
            loadHistory(storedConvId);
        }

    }, [connectionStatus, setActiveConversationId, loadHistory]);

    // Current Conversation Data
    const conversation = activeConversationId ? conversations[activeConversationId] : null;
    const messages = conversation?.messages || [];

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Check for unread when closed
    useEffect(() => {
        if (!isOpen && conversation?.unreadCount > 0) {
            setHasUnread(true);
        } else if (isOpen) {
            setHasUnread(false);
            // Reset unread count in context if we had a method, 
            // but `markAsRead` in context sets unreadCount to 0 for the active conversation.
            // We just need to call it when opening.
        }
    }, [conversation?.unreadCount, isOpen]);

    const handleSend = () => {
        if (!inputText.trim() || !activeConversationId) return;
        sendMessage(activeConversationId, inputText);
        setInputText('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

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

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                                <MessageOutlined className="text-4xl mb-3 opacity-30" />
                                <p className="text-sm">Hi! How can we help you with your auto glass needs today?</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                // SenderType 'SHOP' means incoming for us
                                // Use case-insensitive check for robustness
                                const isShop = msg.senderType?.toUpperCase() === 'SHOP';
                                const isSystem = msg.senderType?.toUpperCase() === 'SYSTEM';

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
                </div>
            )}

            {/* Floating Button */}
            <Button
                type="primary"
                shape="circle"
                size="large"
                onClick={handleToggle}
                className={`shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${isOpen ? 'rotate-90 opacity-0 absolute pointer-events-none' : 'rotate-0'}`}
                style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: themeColor || '#7E5CFE',
                    border: 'none'
                }}
            >
                <Badge count={hasUnread ? 1 : 0} dot color="red" offset={[-5, 5]}>
                    <MessageOutlined style={{ fontSize: '24px' }} />
                </Badge>
            </Button>

            {/* Close Button when open - Optional, can just use the X in header, or make the FAB turn into X */}
            {isOpen && (
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    onClick={handleToggle}
                    className="shadow-xl flex items-center justify-center transition-transform hover:scale-105"
                    style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#64748b',
                        border: 'none'
                    }}
                >
                    <CloseOutlined style={{ fontSize: '24px' }} />
                </Button>
            )}
        </div>
    );
};

export default CustomerChatWidget;
