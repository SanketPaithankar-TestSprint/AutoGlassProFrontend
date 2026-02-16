class ChatSocket {
    constructor({ url, token, userId }) {
        this.url = url;
        this.token = token;
        this.userId = userId; // For customer connection
        this.ws = null;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxRetries = 5;
        this.isExplicitDisconnect = false;
    }

    connect() {
        this.isExplicitDisconnect = false;

        // Construct URL with query params if needed
        let connectionUrl = this.url;
        if (this.userId) {
            // Append userId for public customer connection
            // Assuming the base URL might or might not have query params already
            const separator = connectionUrl.includes('?') ? '&' : '?';
            connectionUrl = `${connectionUrl}${separator}userId=${this.userId}`;
        }

        // For shop, token is passed as second argument to WebSocket constructor (subprotocol) purely or 
        // strictly as per blueprint: new WebSocket(url, token)
        // The blueprint says: const ws = new WebSocket(url, jwtToken);

        console.log(`Connecting to WebSocket: ${connectionUrl}`);

        try {
            if (this.token) {
                this.ws = new WebSocket(connectionUrl, this.token);
            } else {
                this.ws = new WebSocket(connectionUrl);
            }
        } catch (error) {
            console.error("WebSocket construction failed:", error);
            this.emit('error', error);
            this.tryReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log("WebSocket Connected");
            this.reconnectAttempts = 0;
            this.emit('open');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Received message:", data);
                this.emit("message", data);
            } catch (e) {
                console.error("Failed to parse incoming message", e);
            }
        };

        this.ws.onclose = (event) => {
            console.log("WebSocket Disconnected", event.code, event.reason);
            this.emit('close', event);
            if (!this.isExplicitDisconnect) {
                this.tryReconnect();
            }
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error", err);
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
