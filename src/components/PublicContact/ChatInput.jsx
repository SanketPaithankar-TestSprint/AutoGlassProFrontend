// src/components/PublicContact/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSend, disabled, themeColor, placeholder }) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    const handleSend = () => {
        if (!value.trim() || disabled) return;
        onSend(value.trim());
        setValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-container">
            <div className="chat-input-wrapper">
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Type your message..."}
                    disabled={disabled}
                    rows={1}
                    style={{ '--theme-color': themeColor }}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={disabled || !value.trim()}
                    style={{ backgroundColor: disabled ? '#cbd5e1' : themeColor }}
                >
                    {disabled ? (
                        <svg className="loading-spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="30 70" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
