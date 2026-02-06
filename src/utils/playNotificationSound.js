export const playNotificationSound = () => {
    try {
        // Simple "Ping" / "Glass" sound (Base64 encoded MP3/WAV)
        // This is a short, pleasant notification sound.
        const audioData = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAEAAYAA+5WRE6npD";
        // Note: The above is a placeholder. I will use a reliable, short "ding" sound URL instead for better quality/reliability if base64 is tricky to get right blind.

        // Using a reliable CDN for a notification sound is often safer than guessing base64 bytes blindly.
        // Google's material design sounds or similar open source.
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // "Bell notification"
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Error playing notification sound:", e));
    } catch (error) {
        console.error("Audio playback failed:", error);
    }
};
