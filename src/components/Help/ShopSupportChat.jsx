import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Input, Button, Card, Avatar, Tooltip, Empty, Spin, Result, Typography, Space, Divider, Tag } from 'antd';
import { 
    SendOutlined, 
    UserOutlined, 
    ShopOutlined, 
    UserAddOutlined, 
    ArrowLeftOutlined, 
    LoadingOutlined,
    DisconnectOutlined,
    MessageOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useShopSupportChat } from '../../hooks/useShopSupportChat';
import { getValidToken } from '../../api/getValidToken';

dayjs.extend(relativeTime);

const { Header, Content, Footer } = Layout;
const { Text, Title, Paragraph } = Typography;

const ShopSupportChat = () => {
    const navigate = useNavigate();
    const token = getValidToken();
    
    // Robust userId retrieval to match ChatContext.jsx
    const getUserId = () => {
        let id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!id) {
            try {
                const stored = localStorage.getItem("ApiToken") || sessionStorage.getItem("ApiToken");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    id = parsed?.data?.userId || parsed?.data?.id;
                }
            } catch (e) {
                console.error("[SupportChat] Failed to parse user ID from token", e);
            }
        }
        return id;
    };

    const userId = getUserId();
    const shopName = localStorage.getItem('businessName') || 'My Shop';

    const {
        messages,
        loading,
        error,
        isConnected,
        sendMessage,
        refreshChat,
        clearConversationId
    } = useShopSupportChat({ userId, token, shopName });

    const [inputValue, setInputValue] = useState('');
    const [tick, setTick] = useState(0); // For dynamic timestamps
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Dynamic timestamps update every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle sending message
    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Show full-screen error ONLY if we have no messages yet (initial load failed)
    if (error && messages.length === 0) {
        return (
            <div className="p-6">
                <Result
                    status="warning"
                    title="Communication Error"
                    subTitle={error}
                    extra={[
                        <Button key="back" onClick={() => navigate('/help')}>Back to Help Center</Button>,
                        <Button key="retry" type="primary" onClick={refreshChat}>Refresh Chat</Button>,
                    ]}
                >
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 max-w-lg mx-auto text-left">
                        <Text type="secondary" className="text-xs block mb-2 font-bold uppercase">Troubleshooting Steps:</Text>
                        <ul className="text-xs text-slate-500 space-y-1.5 pl-4 list-disc">
                            <li>Check your internet connection.</li>
                            <li>Ensure you are still logged in (tokens might expire).</li>
                            <li>Check the browser console (F12) for detailed transport logs.</li>
                        </ul>
                    </div>
                </Result>
            </div>
        );
    }

    return (
        <Layout className="bg-transparent h-screen max-h-[85vh] rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col">
            {/* Header */}
            <header className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/help')}
                        className="hover:bg-blue-50 border-slate-200"
                    />
                    <div className="flex items-center gap-3">
                        <Avatar 
                            icon={<CustomerServiceOutlined />} 
                            className="bg-blue-100 text-blue-600 border-none h-10 w-10 flex items-center justify-center text-lg" 
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <Title level={5} className="!m-0 text-slate-800">Support Representative</Title>
                            </div>
                            <Text type="secondary" className="text-xs">Typically replies in 15 minutes</Text>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Body */}
            <Content className="flex-1 bg-slate-50 relative overflow-y-auto p-4 custom-chat-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                        <Text type="secondary">Establishing connection...</Text>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description={
                                <div className="space-y-4 text-center max-w-xs">
                                    <Text type="secondary">No messages yet. Start a conversation with our support team!</Text>
                                    <Paragraph className="text-[11px] text-slate-400 italic">Our team is available Mon-Fri, 9am - 5pm EST.</Paragraph>
                                </div>
                            } 
                        />
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <Divider plain className="text-[10px] uppercase tracking-widest text-slate-300">Beginning of conversation</Divider>
                        
                        {messages.map((msg, idx) => {
                            const isAdmin = msg.senderType === 'ADMIN';
                            const timestamp = msg.timestamp ? dayjs(msg.timestamp).fromNow() : '';
                            
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} group`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[80%] ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <Avatar 
                                            size="small" 
                                            icon={isAdmin ? <CustomerServiceOutlined /> : <ShopOutlined />} 
                                            className={`${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'} ring-2 ring-white shadow-sm shrink-0`}
                                        />
                                        
                                        <div className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                {isAdmin && (
                                                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {msg.senderName || 'Support'}
                                                    </Text>
                                                )}
                                                {timestamp && <Text className="text-[9px] text-slate-300">{timestamp}</Text>}
                                            </div>
                                            
                                            <div className={`
                                                relative px-4 py-3 rounded-2xl shadow-sm leading-relaxed
                                                ${isAdmin 
                                                    ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                                                    : 'bg-blue-600 text-white rounded-tr-none'
                                                }
                                            `}>
                                                <Paragraph className="!m-0 text-sm whitespace-pre-wrap">
                                                    {msg.message}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </Content>

            {/* Footer / Input */}
            <Footer className="bg-white p-6 border-t border-slate-100 shrink-0">
                <div className="flex items-end gap-3 max-w-5xl mx-auto">
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all p-1">
                        <Input.TextArea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isConnected ? "How can we help you today?" : "Connecting to support..."}
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            disabled={!isConnected || loading}
                            bordered={false}
                            className="w-full py-3 px-4 transition-all resize-none custom-chat-scrollbar text-[15px] shadow-none focus:shadow-none bg-transparent"
                        />
                    </div>
                    
                    <Tooltip title={!inputValue.trim() ? "Type a message" : "Send message"}>
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<SendOutlined className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />} 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || !isConnected}
                            className={`flex items-center justify-center h-12 w-12 rounded-2xl shadow-md transition-all ${inputValue.trim() && isConnected ? 'bg-blue-600 hover:scale-105 active:scale-95 shadow-blue-200' : 'bg-slate-200'}`}
                        />
                    </Tooltip>
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium select-none">
                    <span className="flex items-center gap-1.5 opacity-60"><MessageOutlined className="text-xs" /> PRESS ENTER TO SEND</span>
                    <Divider type="vertical" className="border-slate-200 h-3" />
                    <span 
                        className="flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to end this session and clear chat history?")) {
                                clearConversationId();
                            }
                        }}
                    >
                        <DisconnectOutlined className="text-xs" /> END SESSION
                    </span>
                </div>
            </Footer>

            <style>{`
                .custom-chat-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </Layout>
    );
};

export default ShopSupportChat;
