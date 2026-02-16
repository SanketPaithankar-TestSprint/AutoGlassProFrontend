import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Input, Button, List, Avatar, Badge, Empty, Spin } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';

const ShopChatPanel = () => {
    const {
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        connectionStatus,
        markAsRead
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
    };

    return (
        <div className="flex h-full bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 m-4">
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
                            renderItem={item => (
                                <div
                                    className={`cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-50
                                        ${activeConversationId === item.id ? 'bg-violet-50 border-l-4 border-l-violet-500' : 'pl-1'}
                                    `}
                                    onClick={() => handleSelectConversation(item.id)}
                                >
                                    <List.Item className="px-4 py-3">
                                        <List.Item.Meta
                                            avatar={
                                                <Badge count={item.unreadCount} size="small">
                                                    <Avatar icon={<UserOutlined />} className={activeConversationId === item.id ? 'bg-violet-200 text-violet-700' : ''} />
                                                </Badge>
                                            }
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm ${item.unreadCount > 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                                                        {item.customerName || `Customer ${item.id.substring(0, 6)}...`}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {moment(item.updatedAt).format('HH:mm')}
                                                    </span>
                                                </div>
                                            }
                                            description={
                                                <div className="truncate text-xs text-slate-500 pr-2">
                                                    {item.lastMessage || <i>No messages</i>}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                </div>
                            )}
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
                                <Avatar icon={<UserOutlined />} className="bg-violet-100 text-violet-600" />
                                <div>
                                    <h3 className="font-medium text-slate-800">
                                        {activeConversation ? (activeConversation.customerName || `Customer ${activeConversationId}`) : 'Select a Chat'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
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
                                    <p>No messages yet taking.</p>
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
    );
};

export default ShopChatPanel;
