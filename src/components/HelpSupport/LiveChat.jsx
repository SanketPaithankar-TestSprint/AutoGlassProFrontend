import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { chatMessages, tickets } from "./mockData";
import { ChevronLeft, Send, Paperclip, MoreVertical, Star, CheckCircle } from "lucide-react";

export default function LiveChat() {
  const { ticketId } = useParams();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [messages, setMessages] = useState(chatMessages[ticketId] || []);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    setIsTyping(true);
    setTimeout(() => {
      const supportMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "support",
        message: "Thank you for your message. I'm reviewing this now and will get back to you shortly.",
        timestamp: new Date().toISOString(),
        agentName: "Sarah Mitchell",
      };
      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleEndChat = () => setShowRating(true);
  const handleRatingSubmit = () => setRatingSubmitted(true);

  if (!ticket) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Chat not found</h2>
        <Link
          to="/help-support/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket.chatEnabled) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Chat Not Available</h2>
        <p className="text-slate-600 mb-6">
          Chat is not available for this ticket yet. Please wait for a support agent to accept your ticket.
        </p>
        <Link
          to={`/help-support/tickets/${ticketId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Ticket
        </Link>
      </div>
    );
  }

  if (showRating && !ratingSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Rate Your Support Experience</h2>
        <p className="text-slate-600 mb-8">How would you rate the support you received?</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-12 h-12 ${
                  star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Additional feedback (optional)"
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-6"
        />

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRatingSubmit}
            disabled={rating === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Rating
          </button>
          <button
            onClick={() => setShowRating(false)}
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Continue Chat
          </button>
        </div>
      </div>
    );
  }

  if (ratingSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Thank You for Your Feedback!</h2>
        <p className="text-slate-600 mb-8">Your rating helps us improve our support services.</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/help-support/tickets"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
          >
            View My Tickets
          </Link>
          <Link
            to="/help-support"
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/help-support/tickets" className="hover:text-violet-600 transition-colors">
          My Tickets
        </Link>
        <span>/</span>
        <Link to={`/help-support/tickets/${ticketId}`} className="hover:text-violet-600 transition-colors">
          {ticketId}
        </Link>
        <span>/</span>
        <span className="text-slate-900">Live Chat</span>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Live Support Chat</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-violet-100">Sarah Mitchell - Online</span>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-50 border-slate-2000 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-violet-500">
            <p className="text-sm text-violet-100">
              Regarding: <span className="text-white font-medium">{ticket.subject}</span>
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 bg-slate-50">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-sm lg:max-w-md ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                  {msg.sender === "support" && (
                    <p className="text-xs text-slate-500 mb-1 ml-1">{msg.agentName}</p>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      msg.sender === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">Press Enter to send, Shift + Enter for new line</p>
            <button
              onClick={handleEndChat}
              className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            >
              End Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Link
        to={`/help-support/tickets/${ticketId}`}
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to ticket details
      </Link>
    </div>
  );
}
