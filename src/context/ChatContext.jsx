import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import ChatSocket from '../services/ChatSocket';
import { getValidToken } from '../api/getValidToken';
import chatNotificationSound from '../assets/NotificationForChat.mp3';
import { App } from 'antd';

const ChatContext = createContext(null);

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children, isPublic = false, publicUserId = null }) => {
    const { notification } = App.useApp();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [conversations, setConversations] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const activeConversationIdRef = useRef(null);
    const [visitorId, setVisitorId] = useState(null);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [notifications, setNotifications] = useState([]);

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
                setNotifications(data.data || []);
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
                    unreadCount: 0,
                    messages: [],
                };

                // Preserve existing messages if we already have them
                if (prev[c.conversationId]) {
                    newMap[c.conversationId].messages = prev[c.conversationId].messages;
                    newMap[c.conversationId].unreadCount = prev[c.conversationId].unreadCount;
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
        const { conversationId, message, senderType, timestamp } = payload;
        if (!conversationId) return;

        // ── Customer: persist conversationId on first response ──
        if (isPublic && !localStorage.getItem("chat_conversationId")) {
            localStorage.setItem("chat_conversationId", conversationId);
        }

        const isFromCustomer = senderType !== 'SHOP';
        const isCurrentlyOpen = activeConversationIdRef.current === conversationId;

        // Execute side effects outside of the setState callback
        if (isFromCustomer && !isPublic && !isCurrentlyOpen) {
            const senderName = payload.senderName || payload.name || payload.visitorName || payload.customerName || 'Customer';
            console.log("[ChatContext] Triggering persistent toast for new message from:", senderName);

            // Play chat notification sound
            try {
                const audio = new Audio(chatNotificationSound);
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }

            // Show top-right toast notification (same style as inquiry)
            notification.info({
                key: 'unread-chat-toast',
                message: '💬 New Chat Message',
                description: `You have unread message(s) waiting.`,
                placement: 'topRight',
                duration: 0,
                onClick: () => {
                    window.location.href = '/chat';
                },
                style: { cursor: 'pointer' }
            });
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

            const newMsg = { ...payload };

            // Increment unread 
            let newUnread = existing.unreadCount;

            if (isFromCustomer && !isPublic && !isCurrentlyOpen) {
                newUnread += 1;
            }

            const potentialName = payload.name || payload.senderName || payload.visitorName || payload.customerName;
            const updatedCustomerName = existing.customerName || potentialName;

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: [...existing.messages, newMsg],
                    lastMessage: message,
                    updatedAt: timestamp || Date.now(),
                    unreadCount: newUnread,
                    customerName: updatedCustomerName,
                    visitorId: existing.visitorId || payload.visitorId,
                },
            };
        });

        // Auto-set active for customer if not already set
        if (isPublic && !activeConversationIdRef.current) {
            setActiveConversationId(conversationId);
        }
    };

    // ─── Actions ─────────────────────────────────────────────────────────────

    // switchConversation removed: Shop now uses a single socket and just calls loadHistory(id) 

    const sendMessage = (conversationId, messageText) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || connectionStatus !== 'connected') return;

        if (isPublic) {
            // Customer: send with visitorId; do NOT include conversationId on first message
            const vId = localStorage.getItem("visitorId");
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

    const markAsRead = (conversationId) => {
        setActiveConversationId(conversationId);
        setConversations(prev => {
            if (!prev[conversationId]) return prev;
            return {
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    unreadCount: 0,
                },
            };
        });
    };

    // Calculate total unread
    useEffect(() => {
        let total = 0;
        Object.values(conversations).forEach(c => total += (c.unreadCount || 0));
        setUnreadTotal(total);
    }, [conversations]);

    // Loop notification sound every 10 seconds if there are unread messages (Shop only)
    useEffect(() => {
        let intervalId;
        if (!isPublic && unreadTotal > 0) {
            // Show a persistent toast that matches the red dot exactly
            notification.info({
                key: 'unread-chat-toast',
                message: '💬 New Chat Message',
                description: `You have ${unreadTotal} unread message(s) waiting.`,
                placement: 'topRight',
                duration: 0,
            });

            // Start looping chat notification sound
            intervalId = setInterval(() => {
                try {
                    const audio = new Audio(chatNotificationSound);
                    audio.volume = 0.5;
                    audio.play().catch(() => { });
                } catch (e) { }
            }, 10000);
        } else if (!isPublic && unreadTotal === 0) {
            // Close the persistent toast if all messages are fully read
            notification.destroy('unread-chat-toast');
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
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
            sendMessage,
            sendCustomerMessage,
            loadHistory,
            markAsRead,
            deleteConversation,
            setActiveConversationId,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
