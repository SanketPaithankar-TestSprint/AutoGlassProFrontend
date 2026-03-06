import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSocket from '../services/ChatSocket';
import { getValidToken } from '../api/getValidToken';
import chatNotificationSound from '../assets/NotificationForChat.mp3';
import dingSound from '../assets/ding.mp3';
import { App, Modal, Button } from 'antd';

// Single primed Audio for in-chat ding — must be unlocked during a user gesture
const dingAudio = new Audio(dingSound);
dingAudio.preload = 'auto';
let dingPrimed = false;
const primeDing = () => {
    if (dingPrimed) return;
    dingAudio.volume = 0;
    dingAudio.play().then(() => {
        dingAudio.pause();
        dingAudio.currentTime = 0;
        dingAudio.volume = 0.4;
        dingPrimed = true;
    }).catch(() => {});
};
['click', 'keydown', 'touchstart'].forEach(e => document.addEventListener(e, primeDing));
import { MessageOutlined } from '@ant-design/icons';

const ChatContext = createContext(null);

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children, isPublic = false, publicUserId = null }) => {
    const { notification } = App.useApp();
    const location = useLocation();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [conversations, setConversations] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const activeConversationIdRef = useRef(null);
    const [visitorId, setVisitorId] = useState(null);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showUnreadModal, setShowUnreadModal] = useState(false);

    // Keep refs in sync
    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    // Configuration
    const WS_URL = "wss://y3rxp208gj.execute-api.us-east-1.amazonaws.com/prod/";

    // ─── Initialize Visitor ID for customers ─────────────────────────────────
    useEffect(() => {
        if (isPublic) {
            let vId = localStorage.getItem("visitorId");
            if (!vId) {
                vId = crypto.randomUUID();
                localStorage.setItem("visitorId", vId);
            }
            setVisitorId(vId);
        }
    }, [isPublic]);

    // ─── Shared: wire up socket event listeners ──────────────────────────────
    const attachListeners = useCallback((chatSocket, { requestConversations = false, requestHistory = false, conversationId = null }) => {
        chatSocket.on('open', () => {
            setConnectionStatus('connected');

            if (requestConversations) {
                // Shop initial connect → fetch conversation list + notifications
                chatSocket.send('getConversations', {});
                chatSocket.send('getNotifications', {});
            }

            if (requestHistory && conversationId) {
                // Shop selected a conversation → load its history
                chatSocket.send('getHistory', { conversationId });
            }

            if (isPublic) {
                // Customer: request history using visitorId
                const vId = localStorage.getItem("visitorId");
                if (vId) {
                    chatSocket.send('getHistory', { visitorId: vId });
                }
            }
        });

        chatSocket.on('close', () => {
            setConnectionStatus('disconnected');
        });

        chatSocket.on('statusChange', (status) => {
            setConnectionStatus(status);
        });

        chatSocket.on('message', (data) => {
            handleIncomingMessage(data);
        });
    }, [isPublic]);

    // ─── Initial Connection ──────────────────────────────────────────────────
    const connect = useCallback(() => {
        let chatSocket;

        if (isPublic) {
            // ── CUSTOMER MODE ──
            if (!publicUserId || !visitorId) return;

            const storedConversationId = localStorage.getItem("chat_conversationId");

            console.log("[ChatContext] Initializing PUBLIC connection for visitor:", visitorId);

            chatSocket = new ChatSocket({
                url: WS_URL,
                userId: publicUserId,
                role: 'CUSTOMER',
                conversationId: storedConversationId || undefined,
            });

            chatSocket.connect();
            attachListeners(chatSocket, {});

        } else {
            // ── SHOP MODE ── (initial connect, no conversationId)
            const token = getValidToken();
            if (!token) {
                console.log("[ChatContext] Shop connection skipped: No token available (User not logged in)");
                return null;
            }

            let userId = sessionStorage.getItem('userId');
            if (!userId) {
                try {
                    const stored = localStorage.getItem("ApiToken") || sessionStorage.getItem("ApiToken");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        userId = parsed?.data?.userId || parsed?.data?.id;
                    }
                } catch (e) {
                    console.error("[ChatContext] Failed to parse user ID", e);
                }
            }

            if (!userId) {
                console.log("[ChatContext] Shop connection skipped: Could not determine userId (TenantId)");
                return null;
            }

            console.log("[ChatContext] Connecting SHOP socket for user:", userId);

            chatSocket = new ChatSocket({
                url: WS_URL,
                token: token,
                userId: userId,
                role: 'SHOP',
                // No conversationId → fetch conversation list
            });

            chatSocket.connect();
            attachListeners(chatSocket, { requestConversations: true });
        }

        setSocket(chatSocket);
        socketRef.current = chatSocket;
        setConnectionStatus('connecting');

        return chatSocket;
    }, [isPublic, publicUserId, visitorId, attachListeners]);

    useEffect(() => {
        // Run connect when component mounts OR when tokens in localStorage change
        const socketInstance = connect();

        const handleStorageChange = (e) => {
            if (e.key === 'ApiToken' || e.key === 'userId') {
                console.log("[ChatContext] Auth storage changed, attempting to connect socket...");
                if (!socketRef.current) {
                    connect();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (socketInstance) {
                console.log("[ChatContext] Disconnecting socket...");
                socketInstance.disconnect();
            }
        };
    }, [connect]);

    // ─── Message Router ──────────────────────────────────────────────────────
    const handleIncomingMessage = (data) => {
        console.log(`[ChatContext] Incoming notification type: "${data.type}"`);

        switch (data.type) {
            case "CONVERSATIONS_LIST":
                handleConversationsList(data.data);
                break;
            case "HISTORY":
                handleHistory(data);
                break;
            case "NEW_MESSAGE":
                handleNewMessage(data);
                break;
            case "NOTIFICATIONS":
                handleNotifications(data);
                break;
            case "NEW_QUOTE_REQUEST":
                handleNewQuoteRequest(data);
                break;
            case "NOTIFICATION_UPDATED":
                handleNotificationUpdated(data);
                break;
            case "CONVERSATION_DELETED":
                handleConversationDeleted(data);
                break;
            case "ERROR":
                handleSocketError(data);
                break;
            default:
                break;
        }
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleConversationsList = (list) => {
        if (!Array.isArray(list)) return;

        setConversations(prev => {
            const newMap = {};
            list.forEach(c => {
                newMap[c.conversationId] = {
                    id: c.conversationId,
                    customerName: c.visitorName || `Visitor ${c.visitorId?.slice(0, 4)}`,
                    visitorId: c.visitorId,
                    lastMessage: c.lastMessage,
                    updatedAt: c.updatedAt,
                    unreadCount: c.unreadCount || 0,
                    messages: [],
                };

                // Preserve existing messages and take the higher unread count
                if (prev[c.conversationId]) {
                    newMap[c.conversationId].messages = prev[c.conversationId].messages;
                    newMap[c.conversationId].unreadCount = Math.max(
                        newMap[c.conversationId].unreadCount,
                        prev[c.conversationId].unreadCount || 0
                    );
                }
            });
            return newMap;
        });
    };

    const handleHistory = (data) => {
        // Backend might send { type: "HISTORY", data: { conversationId, messages } }
        const payload = data.data && data.data.messages ? data.data : data;
        let { conversationId, messages } = payload;

        console.log('[ChatContext] handleHistory received:', { conversationId, messageCount: messages?.length });

        if (!Array.isArray(messages)) {
            console.warn('[ChatContext] handleHistory: messages is not an array, ignoring');
            return;
        }

        if (!conversationId) {
            const vId = localStorage.getItem("visitorId");
            if (vId) {
                conversationId = `visitor_${vId}`;
            } else {
                return;
            }
        }

        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                unreadCount: 0,
                updatedAt: Date.now(),
            };

            const sortedMessages = [...messages].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: sortedMessages,
                },
            };
        });

        // Auto-set active for customer
        if (isPublic && !activeConversationIdRef.current) {
            setActiveConversationId(conversationId);
        }
    };

    const handleNewMessage = (msg) => {
        const payload = msg.data || msg;
        console.log("[ChatContext] NEW_MESSAGE payload:", JSON.stringify(payload, null, 2));
        const { conversationId, message, senderType, timestamp, messageId } = payload;
        if (!conversationId) return;

        // ── Customer: persist conversationId on first response ──
        if (isPublic && !localStorage.getItem("chat_conversationId")) {
            localStorage.setItem("chat_conversationId", conversationId);
        }

        const isFromCustomer = senderType !== 'SHOP';
        const isCurrentlyOpen = activeConversationIdRef.current === conversationId;
        const isTabActive = isChatTabActive();

        // Execute side effects outside of the setState callback
        if (isFromCustomer && !isPublic && (!isCurrentlyOpen || !isTabActive)) {
            const senderName = payload.senderName || payload.name || payload.visitorName || payload.customerName || 'Customer';
            console.log("[ChatContext] Triggering persistent toast for new message from:", senderName);

            // Play chat notification sound (chat not in focus)
            try {
                const audio = new Audio(chatNotificationSound);
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }
        }

        // Play in-chat ding for every incoming message while chat is open
        const incomingFromOther = isPublic ? senderType?.toUpperCase() === 'SHOP' : isFromCustomer;
        if (incomingFromOther && isCurrentlyOpen && isTabActive && dingPrimed) {
            try {
                dingAudio.currentTime = 0;
                dingAudio.play().catch(() => {});
            } catch (e) { }
        }

        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                messages: [],
                unreadCount: 0,
                updatedAt: Date.now(),
            };

            // Deduplicate
            const lastMsg = existing.messages[existing.messages.length - 1];
            if (lastMsg && lastMsg.message === message && lastMsg.timestamp === timestamp) {
                return prev;
            }
            if (messageId && existing.messages.some(m => m.messageId === messageId)) {
                return prev;
            }
            if (
                lastMsg &&
                lastMsg.senderType === senderType &&
                lastMsg.message === message &&
                Math.abs((timestamp || 0) - (lastMsg.timestamp || 0)) < 5000
            ) {
                return prev;
            }

            const newMsg = { ...payload };

            // Increment unread 
            let newUnread = existing.unreadCount;

            if (isFromCustomer && !isPublic && (!isCurrentlyOpen || !isTabActive)) {
                newUnread += 1;
            }

            const potentialName = payload.name || payload.senderName || payload.visitorName || payload.customerName;
            const updatedCustomerName = existing.customerName || potentialName;

            const updatedConversation = {
                ...existing,
                messages: [...existing.messages, newMsg],
                lastMessage: message,
                updatedAt: timestamp || Date.now(),
                unreadCount: newUnread,
                customerName: updatedCustomerName,
                visitorId: existing.visitorId || payload.visitorId,
            };

            const result = { ...prev, [conversationId]: updatedConversation };

            // ── Migrate temp local conversation to the real server conversationId ──
            // When the customer sends their first message, it's stored under a temp
            // key like 'visitor_123'. Once the server responds with the real UUID,
            // merge those locally-appended messages in and remove the temp entry.
            const tempId = activeConversationIdRef.current;
            if (isPublic && tempId && tempId !== conversationId && prev[tempId]) {
                const tempMsgs = prev[tempId].messages || [];
                const mergedMsgs = [...tempMsgs, ...updatedConversation.messages]
                    .reduce((acc, m) => {
                        const isDupe = acc.some(x =>
                            x.message === m.message &&
                            x.senderType === m.senderType &&
                            Math.abs((x.timestamp || 0) - (m.timestamp || 0)) < 5000
                        );
                        if (!isDupe) acc.push(m);
                        return acc;
                    }, [])
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

                result[conversationId] = { ...updatedConversation, messages: mergedMsgs };
                delete result[tempId];
            }

            return result;
        });

        // Always sync activeConversationId to the real server-assigned conversationId
        if (isPublic) {
            setActiveConversationId(conversationId);
        }
    };

    // ─── Handle NEW_QUOTE_REQUEST (Service Inquiry via WebSocket) ─────────
    const handleNewQuoteRequest = (data) => {
        if (isPublic) return; // Only shop sees these

        const notifItem = {
            PK: `USER#${data.tenantId || ''}`,
            SK: `NOTIF#${data.timestamp || Date.now()}`,
            type: 'quote_request',
            message: data.message || `${data.visitorName || 'Customer'} submitted a quote request`,
            read: false,
            timestamp: data.timestamp || Date.now(),
            visitorName: data.visitorName,
            visitorPhone: data.visitorPhone,
            visitorEmail: data.visitorEmail,
            serviceType: data.serviceType,
            city: data.city,
            preference: data.preference,
            details: data.details,
        };

        // Prepend to notification list
        setNotifications(prev => [notifItem, ...prev]);

        // Dispatch INQUIRY_RECEIVED event for Sidebar badge backward compat
        const customEvent = new CustomEvent('INQUIRY_RECEIVED', { detail: data });
        window.dispatchEvent(customEvent);
    };

    const handleNotifications = (data) => {
        const items = data?.data || [];
        if (!Array.isArray(items)) {
            return;
        }
        const sorted = [...items].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotifications(sorted);

        if (!isPublic) {
            // Sync conversation unread counts from stored chat notifications
            // (catches messages received while the shop was offline / not viewing the chat tab)
            const unreadChat = sorted.filter(n => n.type === 'chat' && !n.read);
            if (unreadChat.length > 0) {
                const byConvo = unreadChat.reduce((acc, n) => {
                    const id = n.conversationId;
                    if (!id) return acc;
                    acc[id] = (acc[id] || 0) + 1;
                    return acc;
                }, {});

                setConversations(prev => {
                    const next = { ...prev };
                    Object.entries(byConvo).forEach(([convoId, count]) => {
                        const existing = next[convoId] || {
                            id: convoId,
                            messages: [],
                            unreadCount: 0,
                            updatedAt: Date.now(),
                        };
                        next[convoId] = {
                            ...existing,
                            unreadCount: Math.max(existing.unreadCount || 0, count),
                        };
                    });
                    return next;
                });
            }
        }
    };

    const handleNotificationUpdated = (data) => {
        const notificationId = data.notificationId || data.SK;
        if (!notificationId) return;
        setNotifications(prev =>
            prev.map(n => n.SK === notificationId ? { ...n, read: true } : n)
        );
    };

    const handleConversationDeleted = (data) => {
        const conversationId = data?.conversationId;
        if (!conversationId) return;
        setConversations(prev => {
            const newMap = { ...prev };
            delete newMap[conversationId];
            return newMap;
        });
        if (activeConversationIdRef.current === conversationId) {
            setActiveConversationId(null);
        }
    };

    const handleSocketError = (data) => {
        const message = data?.message || 'Unknown socket error';
        console.error('[ChatContext] Socket error:', message);
        notification.error({
            message: 'Chat Error',
            description: message,
            placement: 'topRight',
            duration: 5,
        });
    };

    // ─── Actions ─────────────────────────────────────────────────────────────

    const appendLocalMessage = useCallback((conversationId, localMessage) => {
        if (!conversationId) return;
        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                messages: [],
                unreadCount: 0,
                updatedAt: Date.now(),
            };

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: [...existing.messages, localMessage],
                    lastMessage: localMessage.message,
                    updatedAt: localMessage.timestamp || Date.now(),
                },
            };
        });
    }, []);

    // switchConversation removed: Shop now uses a single socket and just calls loadHistory(id) 

    const sendMessage = (conversationId, messageText) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || connectionStatus !== 'connected') return;

        if (isPublic) {
            // Customer: send with visitorId; do NOT include conversationId on first message
            const vId = localStorage.getItem("visitorId");
            const localConversationId = localStorage.getItem("chat_conversationId") || `visitor_${vId}`;
            const localMessage = {
                message: messageText,
                senderType: 'CUSTOMER',
                senderName: localStorage.getItem('visitorName') || 'Visitor',
                visitorId: vId,
                timestamp: Date.now(),
                clientMessageId: crypto.randomUUID(),
            };
            appendLocalMessage(localConversationId, localMessage);
            if (!activeConversationIdRef.current) {
                setActiveConversationId(localConversationId);
            }
            const payload = {
                visitorId: vId,
                message: messageText,
            };
            currentSocket.send('sendMessage', payload);
        } else {
            // Shop: always include conversationId
            const payload = {
                conversationId: conversationId,
                message: messageText,
            };
            currentSocket.send('sendMessage', payload);
        }
    };

    // For Customer: specialized first message with name/email
    const sendCustomerMessage = (text, name, email) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || connectionStatus !== 'connected' || !isPublic) return;

        const vId = localStorage.getItem("visitorId");
        const localConversationId = localStorage.getItem("chat_conversationId") || `visitor_${vId}`;
        const localMessage = {
            message: text,
            senderType: 'CUSTOMER',
            senderName: name || 'Visitor',
            visitorId: vId,
            timestamp: Date.now(),
            clientMessageId: crypto.randomUUID(),
        };
        appendLocalMessage(localConversationId, localMessage);
        if (!activeConversationIdRef.current) {
            setActiveConversationId(localConversationId);
        }
        const payload = {
            visitorId: vId,
            message: text,
            name: name || "Visitor",
            email: email || "no-email@test.com",
        };
        currentSocket.send('sendMessage', payload);
    };

    const loadHistory = (conversationId) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || connectionStatus !== 'connected') return;

        if (isPublic) {
            const vId = localStorage.getItem("visitorId");
            currentSocket.send('getHistory', { visitorId: vId });
        } else {
            currentSocket.send('getHistory', { conversationId });
        }
    };

    const deleteConversation = (conversationId) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || connectionStatus !== 'connected' || isPublic) return;

        currentSocket.send('deleteConversation', { conversationId });
        // Optimistic removal
        setConversations(prev => {
            const newMap = { ...prev };
            delete newMap[conversationId];
            return newMap;
        });

        if (activeConversationId === conversationId) {
            setActiveConversationId(null);
        }
    };

    const isChatTabActive = () => {
        if (isPublic) return true;
        if (typeof document === 'undefined') return true;
        if (document.visibilityState !== 'visible') return false;
        const path = window?.location?.pathname || '';
        return path === '/chat';
    };

    const clearUnreadForConversation = useCallback((conversationId) => {
        if (!conversationId || !isChatTabActive()) return;
        setConversations(prev => {
            if (!prev[conversationId] || prev[conversationId].unreadCount === 0) return prev;
            return {
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    unreadCount: 0,
                },
            };
        });
    }, [isPublic]);

    const markAsRead = (conversationId) => {
        setActiveConversationId(conversationId);
        clearUnreadForConversation(conversationId);

        if (!conversationId || isPublic) return;

        const currentSocket = socketRef.current;
        const chatNotifs = notifications.filter(
            n => !n.read && n.type === 'chat' && n.conversationId === conversationId
        );

        if (currentSocket && connectionStatus === 'connected') {
            chatNotifs.forEach(n => {
                currentSocket.send('markNotificationRead', { notificationId: n.SK });
            });
        }

        if (chatNotifs.length > 0) {
            setNotifications(prev =>
                prev.map(n =>
                    n.type === 'chat' && n.conversationId === conversationId
                        ? { ...n, read: true }
                        : n
                )
            );
        }
    };

    // ─── Notification Actions ─────────────────────────────────────────────
    const markNotificationRead = (notificationSK) => {
        const currentSocket = socketRef.current;
        if (currentSocket && connectionStatus === 'connected') {
            currentSocket.send('markNotificationRead', { notificationId: notificationSK });
        }
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.SK === notificationSK ? { ...n, read: true } : n)
        );
    };

    const markAllNotificationsRead = () => {
        const currentSocket = socketRef.current;
        notifications.forEach(n => {
            if (!n.read && currentSocket && connectionStatus === 'connected') {
                currentSocket.send('markNotificationRead', { notificationId: n.SK });
            }
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAllConversationsUnread = useCallback(() => {
        setConversations(prev => {
            const updated = {};
            Object.entries(prev).forEach(([id, convo]) => {
                updated[id] = { ...convo, unreadCount: 0 };
            });
            return updated;
        });
    }, []);

    const refreshNotifications = () => {
        const currentSocket = socketRef.current;
        if (currentSocket && connectionStatus === 'connected') {
            currentSocket.send('getNotifications', {});
        }
    };

    // Unread notification count (bell badge)
    const unreadNotificationCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Calculate total unread chat messages
    useEffect(() => {
        let total = 0;
        Object.values(conversations).forEach(c => total += (c.unreadCount || 0));
        const unreadChatNotifications = notifications.filter(n => n.type === 'chat' && !n.read).length;
        setUnreadTotal(total + unreadChatNotifications);
    }, [conversations, notifications]);

    // Clear unread only when the chat tab is active and visible
    useEffect(() => {
        if (isPublic) return undefined;

        const handleVisibilityOrFocus = () => {
            const convoId = activeConversationIdRef.current;
            if (convoId) {
                clearUnreadForConversation(convoId);
            }
        };

        window.addEventListener('focus', handleVisibilityOrFocus);
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);

        return () => {
            window.removeEventListener('focus', handleVisibilityOrFocus);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        };
    }, [clearUnreadForConversation, isPublic]);

    // When user navigates to /chat (SPA navigation), auto-clear unread & close modal
    useEffect(() => {
        if (isPublic || location.pathname !== '/chat') return;
        setShowUnreadModal(false);
        const convoId = activeConversationIdRef.current;
        if (convoId) {
            clearUnreadForConversation(convoId);
        }
    }, [location.pathname, isPublic, clearUnreadForConversation]);

    // Show modal + loop notification sound when there are unread chats (Shop only)
    useEffect(() => {
        const onChatPage = window?.location?.pathname === '/chat';
        if (isPublic || unreadTotal === 0 || onChatPage) {
            setShowUnreadModal(false);
            return undefined;
        }

        setShowUnreadModal(true);

        let playCount = 0;
        const intervalId = setInterval(() => {
            if (playCount >= 10) {
                clearInterval(intervalId);
                return;
            }
            try {
                const audio = new Audio(chatNotificationSound);
                audio.volume = 0.5;
                audio.play().catch(() => { });
                playCount += 1;
            } catch (e) { }
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, [unreadTotal, isPublic]);


    return (
        <ChatContext.Provider value={{
            socket,
            connectionStatus,
            conversations,
            activeConversationId,
            unreadTotal,
            visitorId,
            notifications,
            unreadNotificationCount,
            sendMessage,
            sendCustomerMessage,
            loadHistory,
            markAsRead,
            deleteConversation,
            setActiveConversationId,
            markNotificationRead,
            markAllNotificationsRead,
            clearAllConversationsUnread,
            refreshNotifications,
        }}>
            {children}

            <Modal
                open={showUnreadModal}
                onCancel={() => setShowUnreadModal(false)}
                footer={null}
                centered
                width={520}
                closable
                maskClosable={false}
                styles={{
                    content: { borderRadius: 16, padding: '40px 48px', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MessageOutlined style={{ fontSize: 36, color: '#ffffff' }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>Unread Live Chats</div>
                    <div style={{ fontSize: 16, color: '#bfdbfe' }}>
                        You have <strong style={{ color: '#ffffff' }}>{unreadTotal}</strong> unread chat{unreadTotal > 1 ? 's' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <Button
                            type="primary"
                            size="large"
                            style={{ borderRadius: 8, paddingInline: 28, background: '#ffffff', borderColor: '#ffffff', color: '#1d4ed8', fontWeight: 600 }}
                            onClick={() => {
                                setShowUnreadModal(false);
                                window.history.pushState({}, '', '/chat');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                        >
                            Go to Messages →
                        </Button>
                    </div>
                </div>
            </Modal>
        </ChatContext.Provider>
    );
};
