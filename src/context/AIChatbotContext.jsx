import React, { createContext, useContext, useReducer, useState } from 'react';

// Initial state
const initialState = {
  isOpen: false,
  isMinimized: false,
  messages: [],
  isLoading: false,
  error: null,
};

// Action types
const actionTypes = {
  TOGGLE_CHAT: 'TOGGLE_CHAT',
  OPEN_CHAT: 'OPEN_CHAT',
  CLOSE_CHAT: 'CLOSE_CHAT',
  MINIMIZE_CHAT: 'MINIMIZE_CHAT',
  MAXIMIZE_CHAT: 'MAXIMIZE_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_CHAT:
      return {
        ...state,
        isOpen: !state.isOpen,
        isMinimized: false,
      };
    case actionTypes.OPEN_CHAT:
      return {
        ...state,
        isOpen: true,
        isMinimized: false,
      };
    case actionTypes.CLOSE_CHAT:
      return {
        ...state,
        isOpen: false,
        isMinimized: false,
      };
    case actionTypes.MINIMIZE_CHAT:
      return {
        ...state,
        isMinimized: true,
      };
    case actionTypes.MAXIMIZE_CHAT:
      return {
        ...state,
        isMinimized: false,
      };
    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case actionTypes.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AIChatbotContext = createContext();

// Provider component
export const AIChatbotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [inputValue, setInputValue] = useState('');

  // Action creators
  const toggleChat = () => {
    dispatch({ type: actionTypes.TOGGLE_CHAT });
  };

  const openChat = () => {
    dispatch({ type: actionTypes.OPEN_CHAT });
  };

  const closeChat = () => {
    dispatch({ type: actionTypes.CLOSE_CHAT });
  };

  const minimizeChat = () => {
    dispatch({ type: actionTypes.MINIMIZE_CHAT });
  };

  const maximizeChat = () => {
    dispatch({ type: actionTypes.MAXIMIZE_CHAT });
  };

  const addMessage = (message) => {
    dispatch({ 
      type: actionTypes.ADD_MESSAGE, 
      payload: {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }
    });
  };

  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  };

  const clearMessages = () => {
    dispatch({ type: actionTypes.CLEAR_MESSAGES });
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({
      role: 'user',
      content: content.trim(),
    });

    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // TODO: Integrate with actual AI API
      // For now, simulate a response
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: 'This is a placeholder response. The AI integration will be implemented next.',
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  const value = {
    // State
    ...state,
    inputValue,
    
    // Actions
    toggleChat,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    addMessage,
    setLoading,
    setError,
    clearMessages,
    sendMessage,
    setInputValue,
  };

  return (
    <AIChatbotContext.Provider value={value}>
      {children}
    </AIChatbotContext.Provider>
  );
};

// Custom hook to use the context
export const useAIChatbot = () => {
  const context = useContext(AIChatbotContext);
  if (!context) {
    throw new Error('useAIChatbot must be used within an AIChatbotProvider');
  }
  return context;
};

export default AIChatbotContext;
