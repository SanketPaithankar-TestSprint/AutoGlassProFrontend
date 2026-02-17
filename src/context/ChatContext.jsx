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
    const [unreadTotal, setUnreadTotal] = useState(0);

    // Configuration
    const WS_URL = "wss://y3rxp208gj.execute-api.us-east-1.amazonaws.com/prod/";

    const connect = useCallback(() => {
        let chatSocket;

        if (isPublic) {
            // For public customers
            if (!publicUserId) return; // Wait for userId
            chatSocket = new ChatSocket({
                url: WS_URL,
                userId: publicUserId
            });
        } else {
            // For authenticated shop users
            const token = getValidToken();
            if (!token) {
                console.warn("No token available for chat connection");
                return;
            }

            // Extract User ID from storage
            let userId = sessionStorage.getItem('userId');

            if (!userId) {
                try {
                    const stored = localStorage.getItem("ApiToken") || sessionStorage.getItem("ApiToken");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        userId = parsed?.data?.userId || parsed?.data?.id;
                    }
                } catch (e) {
                    console.error("Failed to parse user ID for chat", e);
                }
            }

            chatSocket = new ChatSocket({
                url: WS_URL,
                token: token,
                userId: userId // Pass userId for shop as well to append to URL
            });
        }

        chatSocket.connect();
        setSocket(chatSocket);
        setConnectionStatus('connecting');

        // Event Listeners
        chatSocket.on('open', () => {
            setConnectionStatus('connected');
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
        // Data format received from server:
        // { conversationId, message, senderType, senderId, timestamp }
        // OR Array for history: [ { ... }, { ... } ]

        if (Array.isArray(data)) {
            // Handle History Response (Assuming the backend sends history as an array directly or inside a wrapper)
            // But usually, we might need a differentiator if the generic 'onmessage' catches everything.
            // For now, let's assume if it is an array, it's a history load.
            // OR if the data has specific structure.

            // NOTE: The blueprint says getHistory returns an array.
            // We need to know which conversation this history belongs to.
            // The "getHistory" action sends conversationId, but the raw array response might not have it attached 
            // if it's just a list of objects. 
            // If the items in the array have 'conversationId', we can use that.
            if (data.length > 0 && data[0].conversationId) {
                const convId = data[0].conversationId;
                updateConversationHistory(convId, data);
            }
            return;
        }

        if (data.conversationId && data.message) {
            // Single new message
            updateConversationWithMessage(data.conversationId, data);
        }
    };

    const updateConversationWithMessage = (conversationId, msgData) => {
        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                messages: [],
                unreadCount: 0,
                lastMessage: '',
                updatedAt: Date.now()
            };

            const isOwnMessage = !isPublic && msgData.senderType === 'SHOP'; // Simplification
            // Ideally we check senderId vs current user ID

            // Avoid duplicates if message already exists (e.g. echo)
            // Check by timestamp (if close) and content, or some unique ID if available.
            // Since we don't have unique IDs from client, we'll check if the last message 
            // has same content and was sent recently (within 2 seconds) by the same sender type.

            const lastMsg = existing.messages[existing.messages.length - 1];
            const isDuplicate = lastMsg &&
                lastMsg.message === msgData.message &&
                // Relaxed check: if incoming has no senderType, assume match if content/time match.
                // Or if senderTypes match explicitly.
                (!msgData.senderType || lastMsg.senderType === msgData.senderType) &&
                (Math.abs((msgData.timestamp || Date.now()) - (lastMsg.timestamp || Date.now())) < 5000);

            if (isDuplicate) {
                return prev;
            }

            const newMessages = [...existing.messages, msgData];

            // Sort by timestamp if needed, usually appended is fine for realtime.

            let newUnread = existing.unreadCount;
            // If we are NOT viewing this conversation right now, increment unread
            if (activeConversationId !== conversationId) {
                newUnread += 1;
            }

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: newMessages,
                    lastMessage: msgData.message,
                    updatedAt: msgData.timestamp || Date.now(),
                    unreadCount: newUnread
                }
            };
        });
    };

    const updateConversationHistory = (conversationId, historyArray) => {
        setConversations(prev => {
            const existing = prev[conversationId] || {
                id: conversationId,
                messages: [],
                unreadCount: 0
            };

            // Merge or replace? Usually replace history or prepend.
            // Let's replace for now as "getHistory" likely returns full set or paginated set.
            // Sorted by timestamp
            const sorted = [...historyArray].sort((a, b) => a.timestamp - b.timestamp);

            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: sorted,
                    updatedAt: sorted.length > 0 ? sorted[sorted.length - 1].timestamp : Date.now()
                }
            };
        });
    };

    const sendMessage = (conversationId, messageText) => {
        if (socket && connectionStatus === 'connected') {
            const payload = {
                conversationId,
                message: messageText
            };
            socket.send('sendMessage', payload);

            // Optimistic update
            const optimisticMsg = {
                conversationId,
                message: messageText,
                senderType: isPublic ? 'CUSTOMER' : 'SHOP',
                timestamp: Date.now()
            };
            updateConversationWithMessage(conversationId, optimisticMsg);
        }
    };

    const loadHistory = (conversationId) => {
        if (socket && connectionStatus === 'connected') {
            socket.send('getHistory', { conversationId });
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

    // Calculate total unread (mostly for Shop Sidebar)
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
            sendMessage,
            loadHistory,
            markAsRead,
            setActiveConversationId // Expose to allow manual switching
        }}>
            {children}
        </ChatContext.Provider>
    );
};
