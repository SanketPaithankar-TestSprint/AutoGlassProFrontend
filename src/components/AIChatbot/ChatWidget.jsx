import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAIChatbot } from '../../context/AIChatbotContext';
import ChatConversation from './ChatConversation';

const ChatWidget = () => {
  const { 
    isOpen, 
    isMinimized, 
    toggleChat, 
    closeChat, 
    minimizeChat, 
    maximizeChat,
    messages 
  } = useAIChatbot();
  
  const [isHovered, setIsHovered] = useState(false);

  // Calculate widget opacity based on state
  const getWidgetOpacity = () => {
    if (isOpen) return 1;
    if (isHovered) return 0.8;
    return 0.3;
  };

  // Widget animation variants
  const widgetVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: getWidgetOpacity(),
      transition: { duration: 0.2 }
    },
    exit: { scale: 0.8, opacity: 0 }
  };

  // Chat window animation variants
  const chatVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-xs opacity-90">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={isMinimized ? maximizeChat : minimizeChat}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </button>
                  <button
                    onClick={closeChat}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <ChatConversation />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Widget Button */}
      <motion.div
        variants={widgetVariants}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={toggleChat}
        className="relative cursor-pointer"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-lg">
          <MessageCircle size={24} />
          
          {/* Notification dot for new messages */}
          {!isOpen && messages.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap"
          >
            Chat with AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatWidget;
