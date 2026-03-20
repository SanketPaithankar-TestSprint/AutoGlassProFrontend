import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { Input, Button, List, Avatar, Badge, Dropdown, Skeleton } from 'antd';
import {
    SendOutlined, UserOutlined, DeleteOutlined, MessageOutlined,
    CloseOutlined, ArrowLeftOutlined, MoreOutlined, CheckOutlined, SearchOutlined, RobotOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import ShopChatMobile from './ShopChatMobile';

// Deterministic blue/violet shade from conversation id
const AVATAR_COLORS = [
    { bg: '#bfdbfe', text: '#1e40af' },
];

const getAvatarColor = (id = '') => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// Mobile header height matches pt-16 = 4rem in App.jsx
const MOBILE_HEADER_H = '4rem';
const LONG_PRESS_DELAY = 500; // ms

const ShopChatPanel = () => {
    const { t } = useTranslation();
    const {
        conversations,
        activeConversationId,
        sendMessage,
        connectionStatus,
        markAsRead,
        deleteConversation,
        loadHistory,
        setActiveConversationId,
    } = useChat();

    const [inputText, setInputText] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Explicit mobile detection to avoid CSS breakpoint leakages
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Mobile navigation state
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    // ── Multi-select state ────────────────────────────────────────────────────
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const longPressTimer = useRef(null);
    const isLongPressing = useRef(false);

    const sortedConversations = Object.values(conversations).sort(
        (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );

    // Filter by search query (name or last message)
    const q = searchQuery.trim().toLowerCase();
    const filteredConversations = q
        ? sortedConversations.filter(c =>
            (c.customerName || '').toLowerCase().includes(q) ||
            (c.lastMessage || '').toLowerCase().includes(q)
        )
        : sortedConversations;

    const openSearch = () => {
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const activeConversation = conversations[activeConversationId];
    const prevConversationId = useRef(activeConversationId);

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => { 
        const isNewChat = prevConversationId.current !== activeConversationId;
        scrollToBottom(isNewChat ? 'auto' : 'smooth');
        prevConversationId.current = activeConversationId;

        if (activeConversation?.messages && activeConversation.messages.length > 0) {
            setMessagesLoading(false);
        }
    }, [activeConversation?.messages, activeConversationId]);

    const handleSend = () => {
        if (!inputText.trim() || !activeConversationId) return;
        sendMessage(activeConversationId, inputText);
        setInputText('');
    };

    const handleSelectConversation = (id) => {
        setActiveConversationId(id);
        markAsRead(id);
        // Guarantee the skeleton is visible for a short time if we have no messages
        if (!conversations[id]?.messages || conversations[id].messages.length === 0) {
            setMessagesLoading(true);
            // Dismiss skeleton and show 'Empty State' if server history returns nothing
            setTimeout(() => {
                setMessagesLoading(false);
            }, 800);
        } else {
            setMessagesLoading(false);
        }
        loadHistory(id);
        setMobileView('chat');
    };

    const handleBackToList = () => {
        setMobileView('list');
        setActiveConversationId(null);
    };

    // ── Selection helpers ─────────────────────────────────────────────────────
    const enterSelectMode = (id) => {
        setIsSelecting(true);
        setSelectedIds(new Set([id]));
    };

    const exitSelectMode = () => {
        setIsSelecting(false);
        setSelectedIds(new Set());
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(sortedConversations.map(c => c.id)));
    };

    const handleBulkDelete = () => {
        const count = selectedIds.size;
        if (!window.confirm(`Delete ${count} conversation${count > 1 ? 's' : ''}?`)) return;
        selectedIds.forEach(id => deleteConversation(id));
        // If active conversation was among deleted, close it
        if (selectedIds.has(activeConversationId)) {
            setActiveConversationId(null);
            setMobileView('list');
        }
        exitSelectMode();
    };

    // ── Long press handlers (clean implementation) ───────────────────────────
    const handlePointerDown = (id) => (e) => {
        // Only react to primary touch/click
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        isLongPressing.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPressing.current = true;
            if (!isSelecting) {
                enterSelectMode(id);
            } else {
                toggleSelect(id);
            }
            if (navigator.vibrate) navigator.vibrate(40);
        }, LONG_PRESS_DELAY);
    };

    const handlePointerUpOrLeave = () => {
        clearTimeout(longPressTimer.current);
    };

    // ── Item tap (normal click) ───────────────────────────────────────────────
    const handleItemClick = (id) => {
        // If the pointerup fired after a long press, ignore this click
        if (isLongPressing.current) {
            isLongPressing.current = false;
            return;
        }

        if (isSelecting) {
            toggleSelect(id);
        } else {
            handleSelectConversation(id);
        }
    };

    // ── Right-click on desktop ────────────────────────────────────────────────
    const handleContextMenu = (id) => (e) => {
        e.preventDefault();
        if (!isSelecting) {
            enterSelectMode(id);
        }
    };


    // ─── Conversation List Panel ──────────────────────────────────────────────
    const allSelected = selectedIds.size === sortedConversations.length && sortedConversations.length > 0;

    const ConversationList = (
        <div className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>

            {/* ── List Header ── */}
            {isSelecting ? (
                /* Selection-mode header */
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exitSelectMode}
                            className="text-slate-500 hover:text-slate-700 transition-colors"
                            aria-label={t('chat.cancelSelection')}
                        >
                            <CloseOutlined className="text-base" />
                        </button>
                        <span className="text-slate-700 font-semibold text-sm">
                            {selectedIds.size} {t('chat.selected')}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={allSelected ? () => setSelectedIds(new Set()) : selectAll}
                            className="font-semibold text-xs transition-colors hover:opacity-80 active:opacity-75"
                            style={{ color: '#0284c7' }}
                        >
                            {allSelected ? t('chat.deselectAll') : t('chat.selectAll')}
                        </button>
                        <button
                            disabled={selectedIds.size === 0}
                            onClick={handleBulkDelete}
                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={
                                selectedIds.size > 0
                                    ? { backgroundColor: '#ef4444', color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                                    : { backgroundColor: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }
                            }
                        >
                            {t('chat.delete')}
                        </button>
                    </div>
                </div>
            ) : (
                /* Normal header */
                <div className="flex-shrink-0">
                    {/* Title row */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="font-semibold text-lg text-slate-700">{t('chat.conversations')}</h2>
                        <div className="flex items-center gap-1">
                            <Badge
                                status={connectionStatus === 'connected' ? 'success' : 'error'}
                                text={<span className="text-xs text-slate-500">{t(`chat.${connectionStatus}`)}</span>}
                            />
                            <button
                                onClick={openSearch}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
                                aria-label="Search conversations"
                            >
                                <SearchOutlined className="text-slate-500 text-base" />
                            </button>
                        </div>
                    </div>

                    {/* Animated search bar */}
                    <div
                        className="overflow-hidden transition-all duration-200"
                        style={{ maxHeight: isSearchOpen ? '56px' : '0px', opacity: isSearchOpen ? 1 : 0 }}
                    >
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-100">
                            <SearchOutlined className="text-slate-400 text-sm flex-shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <CloseOutlined className="text-xs" />
                                </button>
                            )}
                            <button
                                onClick={closeSearch}
                                className="text-slate-400 hover:text-slate-600 transition-colors ml-1 text-xs font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Scrollable list ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                        {q ? (
                            <>
                                <SearchOutlined className="text-3xl text-slate-300 mb-3" />
                                <p className="text-slate-400 text-sm">No chats found for <strong>&quot;{searchQuery}&quot;</strong></p>
                            </>
                        ) : (
                            <p className="text-slate-400 text-sm">No conversations yet</p>
                        )}
                    </div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredConversations}
                        renderItem={item => {
                            const color = getAvatarColor(item.id);
                            const isActive = activeConversationId === item.id;
                            const isChecked = selectedIds.has(item.id);

                            return (
                                <div
                                        className={`
                                        cursor-pointer select-none transition-all border-b border-slate-100
                                        ${isSelecting
                                            ? isChecked
                                                ? 'bg-slate-100 border-l-4 border-l-slate-400'
                                                : 'border-l-4 border-l-transparent'
                                            : isActive
                                                ? 'bg-violet-50 border-l-4 border-l-violet-500'
                                                : 'border-l-4 border-l-transparent'
                                        }
                                    `}
                                    onClick={() => handleItemClick(item.id)}
                                    onContextMenu={handleContextMenu(item.id)}
                                    onPointerDown={handlePointerDown(item.id)}
                                    onPointerUp={handlePointerUpOrLeave}
                                    onPointerLeave={handlePointerUpOrLeave}
                                    onPointerCancel={handlePointerUpOrLeave}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">

                                        {/* Checkbox / Avatar */}
                                        <div className="flex-shrink-0 relative">
                                            {isSelecting ? (
                                                <div
                                                    className={`
                                                        w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-150
                                                        ${isChecked
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'bg-white border-slate-300'
                                                        }
                                                    `}
                                                >
                                                    {isChecked && <CheckOutlined className="text-white text-xs" />}
                                                </div>
                                            ) : (
                                                <Badge count={item.unreadCount} size="small">
                                                    <Avatar
                                                        icon={<UserOutlined />}
                                                        style={{ backgroundColor: color.bg, color: color.text }}
                                                    />
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-sm truncate pr-2 ${item.unreadCount > 0 && !isSelecting
                                                        ? 'font-bold text-slate-800'
                                                        : 'font-medium text-slate-600'
                                                    }`}>
                                                    {item.customerName || `${t('chat.customer')} ${item.id.substring(0, 6)}...`}
                                                </span>
                                                <span className="text-[11px] text-slate-400 flex-shrink-0 pl-1">
                                                    {moment(item.updatedAt).format('HH:mm')}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-slate-400">
                                                {item.lastMessage || <i>{t('chat.noMessages')}</i>}
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
    );


    // ─── Chat Area Panel ──────────────────────────────────────────────────────
    const ChatArea = (
        <div className="flex flex-col bg-white" style={{ height: '100%', minHeight: 0 }}>
            {activeConversationId ? (
                <>
                    {/* ── Fixed Chat Header ── */}
                    <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            {/* Back button — mobile only */}
                            <button
                                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors mr-1"
                                onClick={handleBackToList}
                                aria-label="Back to conversations"
                            >
                                <ArrowLeftOutlined className="text-slate-600 text-base" />
                            </button>
                            <Avatar
                                icon={<UserOutlined />}
                                style={(() => {
                                    const c = getAvatarColor(activeConversationId);
                                    return { backgroundColor: c.bg, color: c.text };
                                })()}
                            />
                            <div>
                                <h3 className="font-medium text-slate-800 text-sm leading-tight">
                                    {activeConversation
                                        ? activeConversation.customerName || `${t('chat.customer')} ${activeConversationId}`
                                        : t('chat.selectChat')}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {connectionStatus === 'connected' ? t('chat.online') : t('chat.offline')}
                                </p>
                            </div>
                        </div>
                        <Dropdown
                            trigger={['click']}
                            menu={{
                                items: [
                                    {
                                        key: 'close',
                                        icon: <CloseOutlined />,
                                        label: t('chat.closeChat'),
                                        onClick: () => {
                                            setActiveConversationId(null);
                                            setMobileView('list');
                                        },
                                    },
                                    {
                                        key: 'delete',
                                        icon: <DeleteOutlined />,
                                        label: t('chat.deleteConversation'),
                                        danger: true,
                                        onClick: () => {
                                            if (window.confirm(t('chat.deleteConversationConfirm'))) {
                                                deleteConversation(activeConversationId);
                                                setMobileView('list');
                                            }
                                        },
                                    },
                                ],
                            }}
                        >
                            <Button
                                type="text"
                                icon={<MoreOutlined className="text-slate-500 text-lg" />}
                                className="hover:bg-slate-100 rounded-full"
                            />
                        </Dropdown>
                    </div>

                    {/* ── Scrollable Messages ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                        {messagesLoading ? (
                            // Show skeletons while loading
                            <>
                                {[...Array(6)].map((_, idx) => (
                                    <div key={idx} className={`flex ${idx % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                        <Skeleton.Button active style={{ width: 180, height: 32, borderRadius: 16, marginBottom: 8 }} />
                                    </div>
                                ))}
                            </>
                        ) : activeConversation?.messages && activeConversation.messages.length > 0 ? (
                            activeConversation.messages.map((msg, idx) => {
                                const isMe = msg.senderType === 'SHOP';
                                const isAi = msg.senderType === 'AI';
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {!isMe && isAi && (
                                            <Avatar 
                                                size="small" 
                                                icon={<RobotOutlined />} 
                                                className="mr-2 mt-1 shrink-0" 
                                                style={{ backgroundColor: '#10b981', color: 'white' }} 
                                            />
                                        )}
                                        <div className={`
                                            max-w-[75%] rounded-xl px-4 py-2 text-sm shadow-sm
                                            ${isMe
                                                ? 'bg-violet-600 text-white rounded-br-none'
                                                : isAi
                                                    ? 'bg-emerald-50 text-slate-700 border border-emerald-100 rounded-bl-none'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                            }
                                        `}>
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
                                <p>{t('chat.noMessagesYet')}</p>
                                <p className="text-xs">{t('chat.startConversation')}</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Fixed Typing Bar ── */}
                    <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
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
                                className="bg-violet-600 hover:bg-violet-700 border-none shadow-md flex items-center justify-center flex-shrink-0"
                            />
                        </div>
                    </div>
                </>
            ) : (
                /* Empty state — desktop only */
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white min-h-0">
                    <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-6">
                        <MessageOutlined className="text-4xl text-violet-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('chat.selectConversationToStart')}</h2>
                    <p className="text-sm text-slate-500">{t('chat.chooseCustomerToList')}</p>
                </div>
            )}
        </div>
    );

    // ─── Root Render ──────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <ShopChatMobile 
                mobileView={mobileView} 
                ConversationList={ConversationList} 
                ChatArea={ChatArea} 
                mobileHeaderHeight={MOBILE_HEADER_H} 
            />
        );
    }
    
    return (
        <div
            className="flex bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 m-4"
            style={{ height: 'calc(100vh - 2rem)' }}
        >
            <div className="w-1/3 border-r border-slate-200 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
                {ConversationList}
            </div>
            <div className="w-2/3 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
                {ChatArea}
            </div>
        </div>
    );
};

export default ShopChatPanel;
