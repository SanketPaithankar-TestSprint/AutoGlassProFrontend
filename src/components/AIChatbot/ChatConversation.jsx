import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAIChatbot } from '../../context/AIChatbotContext';
import ChatMessage from './ChatMessage';

const ChatConversation = () => {
  const {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    isLoading,
    error,
    clearMessages
  } = useAIChatbot();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Welcome message variants
  const welcomeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              variants={welcomeVariants}
              initial="initial"
              animate="animate"
              className="text-center text-gray-500 py-8"
            >
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Hello! I'm your AI Assistant</h3>
                <p className="text-sm">How can I help you today?</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start mb-4"
            >
              <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-2">
                <Loader2 className="animate-spin text-gray-500" size={16} />
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="text-red-500" size={16} />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {/* Clear messages button */}
        {messages.length > 0 && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={clearMessages}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Clear conversation</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {/* Character count indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-gray-400">
                {inputValue.length}/500
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        {/* Hint text */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
