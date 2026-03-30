import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { useAIChatbot } from '../../context/AIChatbotContext';
import ChatConversation from './ChatConversation';

const ChatWidget = ({ collapsed = true }) => {
  const { 
    isOpen, 
    toggleChat, 
    closeChat, 
    messages 
  } = useAIChatbot();
  
  const [isHovered, setIsHovered] = useState(false);
  const chatRef = useRef(null);

  // Close chat when clicking outside (but not when clicking X icon)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        closeChat();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeChat]);

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
    <div className={`fixed bottom-20 z-50 flex flex-col items-start transition-all duration-300 ${
    collapsed ? 'left-24' : 'left-54'
  }`}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-4"
            ref={chatRef}
          >
            <div ref={chatRef} className="bg-white rounded-xl shadow-xl border border-gray-200 w-96 h-[500px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="!bg-[#203a78ff] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-white">Support Assistant</h3>
                  <p className="text-xs text-gray-300">Ask me anything</p>
                </div>
              </div>

              {/* Chat Content */}
              <ChatConversation />
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
        onClick={isOpen ? closeChat : toggleChat}
        className="relative cursor-pointer"
      >
        <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg relative">
          {isOpen ? (
            <X size={24} className="absolute inset-0 flex items-center justify-center" />
          ) : (
            <MessageSquare size={20} />
          )}
          
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
              className="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700"
            >
              Chat with Support Assistant
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
            </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatWidget;
