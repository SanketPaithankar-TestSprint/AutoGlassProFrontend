// src/components/PublicContact/MessageBubble.jsx
import React from 'react';

const MessageBubble = ({ message, sender, themeColor }) => {
    const isAi = sender === 'ai';

    // AI avatar SVG
    const aiAvatar = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            <circle cx="8" cy="14" r="1.5" />
            <circle cx="16" cy="14" r="1.5" />
        </svg>
    );

    // User avatar SVG
    const userAvatar = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );

    return (
        <div className={`message-wrapper ${sender}`}>
            {/* AI: Avatar first, then bubble */}
            {isAi && (
                <>
                    <div className={`message-avatar ${sender}`}>
                        {aiAvatar}
                    </div>
                    <div className={`message-bubble ${sender}`}>
                        {message}
                    </div>
                </>
            )}
            {/* User: Bubble first, then avatar (to appear on right) */}
            {!isAi && (
                <>
                    <div
                        className={`message-bubble ${sender}`}
                        style={{ backgroundColor: themeColor }}
                    >
                        {message}
                    </div>
                    <div className={`message-avatar ${sender}`}>
                        {userAvatar}
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageBubble;
