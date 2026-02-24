import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Input, Button, List, Avatar, Badge, Empty, Spin } from 'antd';
import { SendOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

// Deterministic blue/violet shade from conversation id
const AVATAR_COLORS = [
    { bg: '#ede9fe', text: '#6d28d9' }, // violet-100 / violet-700
    { bg: '#ddd6fe', text: '#5b21b6' }, // violet-200 / violet-800
    { bg: '#c4b5fd', text: '#4c1d95' }, // violet-300 / violet-900
    { bg: '#e0e7ff', text: '#3730a3' }, // indigo-100 / indigo-800
    { bg: '#c7d2fe', text: '#3730a3' }, // indigo-200 / indigo-800
    { bg: '#a5b4fc', text: '#312e81' }, // indigo-300 / indigo-900
    { bg: '#dbeafe', text: '#1d4ed8' }, // blue-100 / blue-700
    { bg: '#bfdbfe', text: '#1e40af' }, // blue-200 / blue-800
];

const getAvatarColor = (id = '') => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const ShopChatPanel = () => {
    const {
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        connectionStatus,
        markAsRead,
        deleteConversation,
        loadHistory
    } = useChat();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Convert conversations map to array and sort by latest update
    const sortedConversations = Object.values(conversations).sort((a, b) => {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    const activeConversation = conversations[activeConversationId];

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages]);

    // Handle sending message
    const handleSend = () => {
        if (!inputText.trim() || !activeConversationId) return;

        sendMessage(activeConversationId, inputText);
        setInputText('');
    };

    const handleSelectConversation = (id) => {
        setActiveConversationId(id);
        markAsRead(id);
        loadHistory(id); // Fetch history when selecting a conversation
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-100 p-4">
            <div className="flex h-full bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                {/* Sidebar List */}
                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="font-semibold text-lg text-slate-700">Conversations</h2>
                        <Badge status={connectionStatus === 'connected' ? 'success' : 'error'} text={connectionStatus} />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {sortedConversations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                No conversations yet
                            </div>
                        ) : (
                            <List
                                itemLayout="horizontal"
                                dataSource={sortedConversations}
                                renderItem={item => {
                                    const color = getAvatarColor(item.id);
                                    const isActive = activeConversationId === item.id;
                                    return (
                                        <div
                                            className={`cursor-pointer transition-colors border-b border-slate-100 ${isActive ? 'bg-violet-50 border-l-4 border-l-violet-500' : 'border-l-4 border-l-transparent'
                                                }`}
                                            onClick={() => handleSelectConversation(item.id)}
                                        >
                                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    <Badge count={item.unreadCount} size="small">
                                                        <Avatar
                                                            icon={<UserOutlined />}
                                                            style={{ backgroundColor: color.bg, color: color.text }}
                                                        />
                                                    </Badge>
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className={`text-sm truncate pr-2 ${item.unreadCount > 0
                                                                ? 'font-bold text-slate-800'
                                                                : 'font-medium text-slate-600'
                                                            }`}>
                                                            {item.customerName || `Customer ${item.id.substring(0, 6)}...`}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 flex-shrink-0 pl-1">
                                                            {moment(item.updatedAt).format('HH:mm')}
                                                        </span>
                                                    </div>
                                                    <p className="truncate text-xs text-slate-400">
                                                        {item.lastMessage || <i>No messages</i>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-white">
                    {activeConversationId ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={(() => { const c = getAvatarColor(activeConversationId); return { backgroundColor: c.bg, color: c.text }; })()}
                                    />
                                    <div>
                                        <h3 className="font-medium text-slate-800">
                                            {activeConversation ? (activeConversation.customerName || `Customer ${activeConversationId}`) : 'Select a Chat'}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this conversation?')) {
                                            deleteConversation(activeConversationId);
                                        }
                                    }}
                                />
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                                {activeConversation?.messages && activeConversation.messages.length > 0 ? (
                                    activeConversation.messages.map((msg, idx) => {
                                        const isMe = msg.senderType === 'SHOP'; // Or check ID
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`
                                                    max-w-[70%] rounded-xl px-4 py-2 text-sm shadow-sm
                                                    ${isMe
                                                            ? 'bg-violet-600 text-white rounded-br-none'
                                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                                        }
                                                `}
                                                >
                                                    <p>{msg.message}</p>
                                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-violet-200' : 'text-slate-400'}`}>
                                                        {moment(msg.timestamp).format('HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <p>No messages yet.</p>
                                        <p className="text-xs">Start the conversation!</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        className="rounded-full px-4 py-2"
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onPressEnter={handleSend}
                                        disabled={connectionStatus !== 'connected'}
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<SendOutlined />}
                                        onClick={handleSend}
                                        disabled={connectionStatus !== 'connected' || !inputText.trim()}
                                        className="bg-violet-600 hover:bg-violet-700 border-none shadow-md flex items-center justify-center"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <UserOutlined className="text-6xl mb-4 opacity-50" />
                            <p className="text-lg">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopChatPanel;
