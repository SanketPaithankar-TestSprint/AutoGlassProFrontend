class ChatSocket {
    constructor({ url, userId, token, role, conversationId }) {
        this.url = url;
        this.userId = userId;
        this.token = token;       // JWT for Shop
        this.role = role;         // 'SHOP' or 'CUSTOMER'
        this.conversationId = conversationId || null;
        this.ws = null;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxRetries = 5;
        this.isExplicitDisconnect = false;
    }

    buildUrl() {
        let connectionUrl = `${this.url}?userId=${this.userId}`;

        if (this.conversationId) {
            connectionUrl += `&conversationId=${this.conversationId}`;
        }

        return connectionUrl;
    }

    connect() {
        this.isExplicitDisconnect = false;

        const connectionUrl = this.buildUrl();

        // console.log(`[ChatSocket] Connecting as ${this.role || 'Unknown'} to: ${connectionUrl}`);

        try {
            // SHOP: Needs JWT in Sec-WebSocket-Protocol (subprotocol)
            if (this.role === 'SHOP' && this.token) {
                this.ws = new WebSocket(connectionUrl, [this.token]);
            }
            // CUSTOMER: No JWT
            else {
                this.ws = new WebSocket(connectionUrl);
            }
        } catch (error) {
            console.error("[ChatSocket] Connection failed:", error);
            this.emit('error', error);
            this.tryReconnect();
            return;
        }

        this.ws.onopen = () => {
            // console.log("[ChatSocket] Connected");
            this.reconnectAttempts = 0;
            this.emit('open');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit("message", data);
            } catch (e) {
                console.error("[ChatSocket] Parse error", e);
            }
        };

        this.ws.onclose = (event) => {
            // console.log(`[ChatSocket] Disconnected (Code: ${event.code})`);
            this.emit('close', event);
            if (!this.isExplicitDisconnect) {
                this.tryReconnect();
            }
        };

        this.ws.onerror = (err) => {
            console.error("[ChatSocket] Error:", err);
            this.emit('error', err);
        };
    }

    disconnect() {
        this.isExplicitDisconnect = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(action, payload = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = { action, ...payload };
            // console.log("[ChatSocket] Sending:", message);
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn("[ChatSocket] WebSocket is not open. Cannot send message.");
            return false;
        }
    }

    on(event, callback) {
        this.listeners[event] = callback;
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event](data);
        }
    }

    tryReconnect() {
        if (this.reconnectAttempts < this.maxRetries) {
            const timeout = 2000 * Math.pow(1.5, this.reconnectAttempts);
            // console.log(`[ChatSocket] Reconnecting in ${timeout}ms (Attempt ${this.reconnectAttempts + 1}/${this.maxRetries})`);

            this.emit('statusChange', 'reconnecting');

            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, timeout);
        } else {
            console.error("[ChatSocket] Max reconnect attempts reached");
            this.emit('statusChange', 'disconnected');
        }
    }
}

export default ChatSocket;
