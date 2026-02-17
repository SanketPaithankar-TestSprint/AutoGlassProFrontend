class ChatSocket {
    constructor({ url, token, userId, role }) {
        this.url = url;
        this.token = token; // JWT for Shop
        this.userId = userId; // tenantId for Shop URL, or visitorId if needed? 
        // prompt says: 
        // SHOP: wss://...?userId=<tenantId>  & Sec-WebSocket-Protocol: <JWT>
        // CUSTOMER: wss://...?userId=<tenantId> & No JWT

        this.role = role; // 'SHOP' or 'CUSTOMER'
        this.ws = null;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxRetries = 5;
        this.isExplicitDisconnect = false;
    }

    connect() {
        this.isExplicitDisconnect = false;

        // Construct URL
        // Both SHOP and CUSTOMER need ?userId=<tenantId>
        // For Shop, userId param is the tenantId (which is the logged in user's ID).
        // For Customer, userId param is the SEARCH QUERY param 'userId' which maps to tenantId they are visiting. 
        // Wait, the prompt says:
        // SHOP: wss://your-api/prod/?userId=<tenantId>
        // CUSTOMER: wss://your-api/prod/?userId=<tenantId>
        // So in both cases, the URL param `userId` is the SHOP/TENANT ID.

        let connectionUrl = this.url;
        const tenantId = this.userId; // In constructor, we expect this passed value to be the target Tenant/Shop ID.

        if (tenantId) {
            const separator = connectionUrl.includes('?') ? '&' : '?';
            connectionUrl = `${connectionUrl}${separator}userId=${tenantId}`;
        }

        console.log(`[ChatSocket] Connecting as ${this.role || 'Unknown'} to: ${connectionUrl}`);

        try {
            // SHOP: Needs JWT in Sec-WebSocket-Protocol
            if (this.role === 'SHOP' && this.token) {
                this.ws = new WebSocket(connectionUrl, this.token);
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
            console.log("[ChatSocket] Connected");
            this.reconnectAttempts = 0;
            this.emit('open');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // console.log("[ChatSocket] Message:", data); // Verbose
                this.emit("message", data);
            } catch (e) {
                console.error("[ChatSocket] Parse error", e);
            }
        };

        this.ws.onclose = (event) => {
            console.log(`[ChatSocket] Disconnected (Code: ${event.code})`);
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

    send(action, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = { action, ...payload };
            console.log("Sending message:", message);
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn("WebSocket is not open. Cannot send message.");
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
            const timeout = 2000 * Math.pow(1.5, this.reconnectAttempts); // Exponential backoffish
            console.log(`Attempting reconnect in ${timeout}ms (Attempt ${this.reconnectAttempts + 1}/${this.maxRetries})`);

            this.emit('statusChange', 'reconnecting');

            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, timeout);
        } else {
            console.error("Max reconnect attempts reached");
            this.emit('statusChange', 'disconnected');
        }
    }
}

export default ChatSocket;
