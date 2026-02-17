import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import ChatSocket from '../services/ChatSocket';
import { getValidToken } from '../api/getValidToken';

const ChatContext = createContext(null);

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children, isPublic = false, publicUserId = null }) => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connected, reconnecting
    const [conversations, setConversations] = useState({}); // Map: conversationId -> conversationObj
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [visitorId, setVisitorId] = useState(null);
    const [unreadTotal, setUnreadTotal] = useState(0);

    // Configuration
    const WS_URL = "wss://y3rxp208gj.execute-api.us-east-1.amazonaws.com/prod/";

    // Initialize Visitor ID for customers
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

    const connect = useCallback(() => {
        let chatSocket;
        // Cleanup previous socket if exists ???
        // Usually handled by the effect return, but here we might be reconnecting.

        if (isPublic) {
            // --- CUSTOMER MODE ---
            // publicUserId passed as prop is the Tenant/Shop ID we are visiting.
            if (!publicUserId) return;

            // Wait for visitorId initialization
            const vId = localStorage.getItem("visitorId");
            if (!vId) return;

            chatSocket = new ChatSocket({
                url: WS_URL,
                userId: publicUserId, // Tenant ID
                role: 'CUSTOMER'
            });
        } else {
            // --- SHOP MODE ---
            const token = getValidToken();
            if (!token) {
                console.warn("[ChatContext] No token available for shop connection");
                return;
            }

            // Extract User ID (Tenant ID) from storage
            let userId = sessionStorage.getItem('userId');
            if (!userId) {
                // ... fallback logic ...
                try {
                    const stored = localStorage.getItem("ApiToken") || sessionStorage.getItem("ApiToken");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        userId = parsed?.data?.userId || parsed?.data?.id;
                    }
                } catch (e) {
                    console.error("Failed to parse user ID", e);
                }
            }

            if (!userId) {
                console.warn("[ChatContext] Could not determine userId (TenantId)");
                return;
            }

            chatSocket = new ChatSocket({
                url: WS_URL,
                token: token,
                userId: userId, // Tenant ID
                role: 'SHOP'
            });
        }

        chatSocket.connect();
        setSocket(chatSocket);
        setConnectionStatus('connecting');

        // Event Listeners
        chatSocket.on('open', () => {
            setConnectionStatus('connected');
            // Immediate Actions on Connect
            if (isPublic) {
                // Customer: Get History
                const vId = localStorage.getItem("visitorId");
                if (vId) {
                    chatSocket.send('getHistory', { visitorId: vId });
                }
            } else {
                // Shop: Get Conversations
                chatSocket.send('getConversations', {});
            }
        });

        chatSocket.on('close', () => {
            setConnectionStatus('disconnected');
        });

        chatSocket.on('statusChange', (status) => {
            setConnectionStatus(status);
        });

        chatSocket.on('message', (data) => {
            handleIncomingMessage(data, chatSocket); // Pass socket ref if needed, or use state
        });

        return chatSocket;

    }, [isPublic, publicUserId]);

    // Initial Connection
    useEffect(() => {
        const socketInstance = connect();

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [connect]);


    const handleIncomingMessage = (data) => {
        // Dispatch based on 'type'
        // Contract Types: CONVERSATIONS_LIST, HISTORY, NEW_MESSAGE

        switch (data.type) {
            case "CONVERSATIONS_LIST":
                handleConversationsList(data.data);
                break;
            case "HISTORY":
                // data = { type, conversationId, messages: [] }
                // For customer, conversationId might be implied or sent. 
                handleHistory(data);
                break;
            case "NEW_MESSAGE":
                handleNewMessage(data);
                break;
            default:
                // console.warn("Unknown message type:", data);
                // Fallback for raw arrays or different structures if any
                if (Array.isArray(data)) {
                    // Assume history if array?
                }
                break;
        }
    };

    // --- HANDLERS ---

    const handleConversationsList = (list) => {
        if (!Array.isArray(list)) return;

        const newMap = {};
        list.forEach(c => {
            newMap[c.conversationId] = {
                id: c.conversationId,
                customerName: c.visitorName || `Visitor ${c.visitorId?.slice(0, 4)}`, // fallback
                visitorId: c.visitorId,
                lastMessage: c.lastMessage,
                updatedAt: c.updatedAt,
                unreadCount: 0, // Backend doesn't seem to send unread count yet? Default to 0 or logic needed.
                messages: [] // Don't wipe messages if we already have them? 
                // Optimized: merge if exists, but for now simplest is restart or keep messages.
            };

            // Preserve existing messages if we have them
            if (conversations[c.conversationId]) {
                newMap[c.conversationId].messages = conversations[c.conversationId].messages;
                newMap[c.conversationId].unreadCount = conversations[c.conversationId].unreadCount;
            }
        });

        setConversations(newMap);
    };

    const handleHistory = (data) => {
        const { conversationId, messages } = data;
        if (!conversationId || !Array.isArray(messages)) return;

        // If Customer, we might not have 'conversations' map setup like Shop. 
        // We might just need a single 'currentConversation' or store it in map too.
        // Let's store in map for consistency.

        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                unreadCount: 0,
                updatedAt: Date.now()
            };

            const sortedMessages = [...messages].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: sortedMessages,
                    // customer info might be missing here if it was a cold load for customer
                }
            };
        });
    };

    const handleNewMessage = (msg) => {
        // data has message details. 
        // Structure from prompt: { type: 'NEW_MESSAGE', ... } -> implies flat fields?
        // Or { type: 'NEW_MESSAGE', data: { ... } }?
        // Prompt says "Server pushes... { type: 'NEW_MESSAGE', ... }" implying fields are mixed in.
        // Let's assume common fields: conversationId, message, senderType, timestamp

        const { conversationId, message, senderType, timestamp } = msg;
        if (!conversationId) return;

        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                messages: [],
                unreadCount: 0,
                updatedAt: Date.now()
            };

            // Deduplicate
            const lastMsg = existing.messages[existing.messages.length - 1];
            if (lastMsg && lastMsg.message === message && lastMsg.timestamp === timestamp) {
                return prev;
            }

            const newMsg = { ...msg }; // Keep all fields

            // Increment unread if not active (Shop only usually)
            let newUnread = existing.unreadCount;
            if (activeConversationId !== conversationId && !isPublic) {
                newUnread += 1;
            }

            // Extract customer details if present in the message payload
            // The backend might send 'name', 'senderName', 'visitorName', etc.
            // Especially strictly for the shop view
            const potentialName = msg.name || msg.senderName || msg.visitorName || msg.customerName;
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
                    visitorId: existing.visitorId || msg.visitorId
                }
            };
        });
    };

    // --- ACTIONS ---

    const sendMessage = (conversationId, messageText) => {
        if (!socket || connectionStatus !== 'connected') return;

        if (isPublic) {
            // Customer: Needs visitorId, name, email (for first message)
            // Or just visitorId if conversation exists?
            // Prompt: "Send First Message... { action:'sendMessage', visitorId, name, email, message }"
            // "Send Message Later... Same as step 2".
            // So always send visitorId?

            const vId = localStorage.getItem("visitorId");
            // For now hardcode name/email or get from form?
            // The prompt says "Customer must generate visitorId... Store permanently".
            // It also says "Send First Message... { name: 'Rahul', email:... }"
            // We might need a way to pass these if it's the very first message.
            // For now, let's assume we can pass specific payload if provided, or default.

            // We'll overload sendMessage to accept extra args if needed or handle internal state?
            // Simplest: just send standard payload, let UI handle the 'first message' fields if technically possible.
            // BUT, the context `sendMessage` is usually generic.

            const payload = {
                action: 'sendMessage',
                visitorId: vId,
                message: messageText,
                // Add default name/email if not present? 
                // Maybe the backend handles it if missing for subsequent?
                // The prompt says "Send Message Later -> Same as step 2".
                // I will include them if I have them, or generic strings. 
                // Ideally UI asks for Name/Email first.
            };
            socket.send('sendMessage', payload);

        } else {
            // Shop
            const payload = {
                action: 'sendMessage',
                conversationId: conversationId,
                message: messageText
            };
            socket.send('sendMessage', payload);
        }
    };

    // For Customer to send specialized first message with name/email
    const sendCustomerMessage = (text, name, email) => {
        if (!socket || connectionStatus !== 'connected' || !isPublic) return;
        const vId = localStorage.getItem("visitorId");
        const payload = {
            action: 'sendMessage',
            visitorId: vId,
            message: text,
            name: name || "Visitor",
            email: email || "no-email@test.com"
        };
        socket.send('sendMessage', payload);
    };

    const loadHistory = (conversationId) => {
        if (!socket || connectionStatus !== 'connected') return;

        // Shop uses conversationId. Customer uses visitorId.
        if (isPublic) {
            const vId = localStorage.getItem("visitorId");
            socket.send('getHistory', { visitorId: vId });
        } else {
            socket.send('getHistory', { conversationId });
        }
    };

    const deleteConversation = (conversationId) => {
        if (!socket || connectionStatus !== 'connected' || isPublic) return;

        socket.send('deleteConversation', { conversationId });
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
                    unreadCount: 0
                }
            };
        });
    };

    // Calculate total unread
    useEffect(() => {
        let total = 0;
        Object.values(conversations).forEach(c => total += (c.unreadCount || 0));
        setUnreadTotal(total);
    }, [conversations]);

    return (
        <ChatContext.Provider value={{
            socket,
            connectionStatus,
            conversations,
            activeConversationId,
            unreadTotal,
            visitorId,
            sendMessage,
            sendCustomerMessage,
            loadHistory,
            markAsRead,
            deleteConversation,
            setActiveConversationId
        }}>
            {children}
        </ChatContext.Provider>
    );
};
