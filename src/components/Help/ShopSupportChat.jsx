import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Input, Button, Card, Avatar, Tooltip, Empty, Spin, Result, Typography, Space, Divider, Tag, Modal } from 'antd';
import {
    SendOutlined,
    UserOutlined,
    ShopOutlined,
    UserAddOutlined,
    ArrowLeftOutlined,
    LoadingOutlined,
    DisconnectOutlined,
    MessageOutlined,
    CustomerServiceOutlined,
    InfoCircleOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useShopSupportChat } from '../../hooks/useShopSupportChat';
import { getValidToken } from '../../api/getValidToken';

dayjs.extend(relativeTime);

const { Header, Content, Footer } = Layout;
const { Text, Title, Paragraph } = Typography;

const ShopSupportChat = ({ ticket, onClose }) => {
    const ticketId = ticket?.id;
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
        refreshChat
    } = useShopSupportChat({ userId, token, shopName, conversationId: ticketId });

    const [inputValue, setInputValue] = useState('');
    const [tick, setTick] = useState(0); // For dynamic timestamps
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                        <Button key="back" onClick={onClose}>Close Chat</Button>,
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
        <Layout className="bg-transparent h-full max-h-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined className="text-xs sm:text-base" />}
                        onClick={onClose}
                        className="hover:bg-blue-50 border-slate-200 flex items-center justify-center p-0 h-8 w-8 sm:h-10 sm:w-10"
                    />
                    <div className="flex items-center gap-2 md:gap-3">
                        <Avatar
                            icon={<CustomerServiceOutlined />}
                            className="bg-blue-100 text-blue-600 border-none flex items-center justify-center h-8 w-8 text-base sm:h-10 sm:w-10 sm:text-lg"
                        />
                        <div>
                            <div className="flex items-center gap-2 leading-none">
                                <Title level={5} className="!m-0 text-slate-800 text-sm sm:text-base">Support Representative</Title>
                            </div>
                            <Text type="secondary" className="text-[10px] sm:text-xs">Typically replies in 15 minutes</Text>
                        </div>
                    </div>
                </div>
                {ticket && (
                    <Button
                        icon={<InfoCircleOutlined />}
                        onClick={() => setShowTicketModal(true)}
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 flex items-center justify-center p-0 h-8 w-8 sm:h-10 sm:w-10"
                    />
                )}
            </header>

            {/* Chat Body */}
            <Content className="flex-1 min-h-0 bg-white relative overflow-y-auto p-3 sm:p-4 custom-chat-scrollbar">
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
                                    <Paragraph className="text-[11px] text-slate-400 italic">Our team is available Mon-Fri, 10am - 6pm EST.</Paragraph>
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                        <Divider plain className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-300">
                            <span className="inline sm:hidden">Start of chat</span>
                            <span className="hidden sm:inline">Beginning of conversation</span>
                        </Divider>

                        {[...messages]
                            .sort((a, b) => {
                                const timeA = a.timestamp || 0;
                                const timeB = b.timestamp || 0;
                                return timeA - timeB;
                            })
                            .map((msg, idx) => {
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
                                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[80%] ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
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
                                                relative px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm leading-relaxed
                                                ${isAdmin
                                                        ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                                        : 'bg-blue-600 text-white rounded-tr-none'
                                                    }
                                            `}>
                                                    <Paragraph className="!m-0 text-xs sm:text-sm whitespace-pre-wrap">
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
            <Footer className="bg-white p-4 sm:p-6 border-t border-slate-100 shrink-0">
                <div className="flex items-end gap-2 sm:gap-3 max-w-5xl mx-auto">
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all p-1">
                        <Input.TextArea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isConnected ? "How can we help?" : "Connecting..."}
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            disabled={!isConnected || loading}
                            variant="borderless"
                            className="w-full py-2.5 sm:py-3 px-3 sm:px-4 transition-all resize-none custom-chat-scrollbar text-sm sm:text-[15px] shadow-none focus:shadow-none bg-transparent"
                        />
                    </div>

                    <Tooltip title={!inputValue.trim() ? "Type a message" : "Send message"}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined className="text-sm sm:text-base" />}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || !isConnected}
                            className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shadow-md transition-all ${inputValue.trim() && isConnected ? 'bg-blue-600 hover:scale-105 active:scale-95 shadow-blue-200' : 'bg-slate-200 border-none'}`}
                        />
                    </Tooltip>
                </div>
            </Footer>

            {/* Ticket Details Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <InfoCircleOutlined className="text-blue-600" />
                        <span>Ticket Details</span>
                    </div>
                }
                open={showTicketModal}
                onCancel={() => setShowTicketModal(false)}
                footer={[
                    <Button key="close" onClick={() => setShowTicketModal(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {ticket && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <Text className="font-bold text-slate-800 text-lg">{ticket.subject}</Text>
                                    <Text className="text-xs text-slate-400 font-mono tracking-wider">TICKET #{ticket.id?.slice(0, 8)}</Text>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Tag color="blue" className="border-blue-200 font-semibold">{ticket.category}</Tag>
                                    <Tag color={ticket.status === 'OPEN' ? 'green' : ticket.status === 'IN_PROGRESS' ? 'orange' : 'default'} className="font-semibold">
                                        {ticket.status}
                                    </Tag>
                                </div>

                                {ticket.description && (
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                        <Text className="font-semibold text-slate-700 block mb-2">Description:</Text>
                                        {ticket.description}
                                    </div>
                                )}

                                {ticket.attachments && ticket.attachments.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg border border-slate-100">
                                        <Text className="font-semibold text-slate-700 block mb-3">Attachments:</Text>
                                        <div className="space-y-2">
                                            {ticket.attachments.map((attachment, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <LinkOutlined className="text-slate-400" />
                                                    <Text className="text-sm text-slate-600 truncate flex-1">{attachment.name || attachment.fileName || `Attachment ${index + 1}`}</Text>
                                                    <Text className="text-xs text-slate-400">
                                                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)}KB` : ''}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

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
