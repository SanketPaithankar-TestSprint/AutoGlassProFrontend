import { useState, useEffect, useRef, useCallback } from 'react';

// Use the existing VITE_CHAT_WS_URL from ChatContext.jsx or fallback to placeholder
const SOCKET_URL = import.meta.env.VITE_CHAT_WS_URL || 'wss://your-api-id.execute-api.us-east-1.amazonaws.com/prod';

export const useShopSupportChat = ({ userId, token, shopName = 'Unknown', conversationId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;

    const connect = useCallback(() => {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        if (!userId || !token) {
            setError(!userId ? 'User ID not found' : 'Auth token missing');
            setLoading(false);
            return;
        }

        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.onmessage = null;
            socketRef.current.close(1000);
        }

        try {
            // Connect - Use provided conversationId
            const url = `${SOCKET_URL}?userId=${userId}`;
            console.log(`[SupportChat] Connecting for userId: ${userId}, conversationId: ${conversationId || 'none'}`);
            
            const socket = new WebSocket(url, [token]);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('✅ Support Chat WebSocket connected');
                setIsConnected(true);
                setError(null);
                setLoading(false);
                reconnectAttemptsRef.current = 0;

                // Load History with conversationId
                if (!conversationId) {
                    console.warn('⚠️ No conversationId provided');
                }
                
                const payload = {
                    action: "getHistory",
                    isAdminChat: true,
                    conversationId: conversationId  // Always include conversationId
                };
                
                console.log('📤 Sending getHistory:', payload);
                socket.send(JSON.stringify(payload));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📬 Received:', data);

                    // STEP 3: Receive History or New Message
                    if (data.type === "HISTORY") {
                        setMessages(Array.isArray(data.messages) ? data.messages : []);
                        setLoading(false);
                    } else if (data.type === "NEW_MESSAGE") {
                        // Backend data structure for NEW_MESSAGE is often top-level
                        setMessages(prev => [...prev, data]);
                    } else if (data.type === "ERROR") {
                        console.error('❌ Server Error:', data.message);
                        setError(data.message);
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e);
                }
            };

            socket.onclose = (event) => {
                console.warn(`🔌 Socket closed: ${event.code}`);
                setIsConnected(false);
                
                if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    setError('Connection lost. Please refresh.');
                }
            };

            socket.onerror = (err) => console.error('❌ Socket error:', err);

        } catch (err) {
            setError(`Init failed: ${err.message}`);
            setLoading(false);
        }
    }, [userId, token, conversationId]);

    // STEP 4: Send Message to Admin
    const sendMessage = useCallback((text) => {
        if (!text.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        const payload = {
            action: "sendMessage",
            message: text.trim(),
            isAdminChat: true,
            shopName: shopName
        };

        console.log('📤 Sending message:', payload);
        socketRef.current.send(JSON.stringify(payload));
    }, [shopName]);

    const refreshChat = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        setError(null);
        setLoading(true);
        connect();
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.onmessage = null;
                socketRef.current.close(1000);
            }
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connect]);

    return { 
        messages, 
        loading, 
        error, 
        isConnected, 
        sendMessage, 
        refreshChat
    };
};
