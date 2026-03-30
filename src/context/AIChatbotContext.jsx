import React, { createContext, useContext, useReducer, useState } from 'react';
import { getValidToken } from '../api/getValidToken';

// Initial state
const initialState = {
  isOpen: false,
  isMinimized: false,
  messages: [],
  isLoading: false,
  error: null,
  sessionId: null,
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
  SET_SESSION_ID: 'SET_SESSION_ID',
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
        sessionId: null, // Reset session when clearing conversation
      };
    case actionTypes.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload,
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

  const setSessionId = (sessionId) => {
    dispatch({ type: actionTypes.SET_SESSION_ID, payload: sessionId });
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
      const token = getValidToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Build URL with query parameters
      const baseUrl = 'https://api.autopaneai.com/agp/v1/chatbot-answer';
      const params = new URLSearchParams({
        query: content.trim(),
      });

      // Add session_id if it exists
      if (state.sessionId) {
        params.append('session_id', state.sessionId);
      }

      const url = `${baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 422) {
          throw new Error('Invalid input. Please check your message.');
        } else {
          throw new Error('Failed to get response. Please try again.');
        }
      }

      const data = await response.json();

      // Update session ID if returned
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process your request.',
      });

    } catch (error) {
      console.error('Chatbot API Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
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
    setSessionId,
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
